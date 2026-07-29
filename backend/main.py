import os
import pickle
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from twilio.rest import Client
from dotenv import load_dotenv

from agent2_news import get_news_sentiment
from agent3_graph import get_contagion_risk, get_stock_family
from live_monitor import get_live_risk, get_replay_risk
from engine import run_engine

load_dotenv()

MODEL_PATH = os.path.join(os.path.dirname(__file__), "crash_model.pkl")
DATA_DIR = os.path.dirname(__file__)

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

app = FastAPI(title="CrashRadar API", version="3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

twilio_sid = os.getenv("TWILIO_ACCOUNT_SID")
twilio_token = os.getenv("TWILIO_AUTH_TOKEN")
twilio_from = os.getenv("TWILIO_WHATSAPP_FROM")
twilio_to = os.getenv("TWILIO_WHATSAPP_TO")

STOCKS = [
    "RELIANCE", "TCS", "INFY", "HDFCBANK", "ADANIENT",
    "WIPRO", "TITAN", "SBIN", "ICICIBANK", "KOTAKBANK",
    "AXISBANK", "BAJFINANCE", "HINDUNILVR", "MARUTI",
    "LT", "NTPC", "ONGC", "POWERGRID", "SUNPHARMA",
    "HCLTECH", "ITC", "ULTRACEMCO", "BHARTIARTL", "ASIANPAINT"
]


# ---------- Agent 1 helpers ----------

def load_stock_csv(stock: str) -> pd.DataFrame:
    paths_to_try = [
        os.path.join(DATA_DIR, f"{stock}_data.csv"),
        os.path.join(DATA_DIR, f"{stock.upper()}_data.csv"),
        os.path.join(DATA_DIR, f"{stock.lower()}_data.csv"),
    ]
    for p in paths_to_try:
        if os.path.exists(p):
            df = pd.read_csv(p, index_col=0)
            df["Stock"] = stock.upper()
            return df
    raise FileNotFoundError(f"No CSV found for {stock}")


def prepare_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.dropna(subset=["Close"]).copy()
    df["Prev_Change"] = df["Daily_Change_%"].shift(1)
    df["Prev_Volume"] = df["Volume"].shift(1)
    df["Prev_Close"] = df["Close"].shift(1)
    df.dropna(inplace=True)
    return df


def predict_risk(df: pd.DataFrame):
    X = df[["Prev_Change", "Prev_Volume", "Prev_Close"]]
    proba = model.predict_proba(X)[-1][1]
    risk_score = float(round(proba * 100, 2))
    is_danger = bool(risk_score > 60)
    return risk_score, is_danger


def generate_reasons(df: pd.DataFrame, risk_score: float) -> list:
    reasons = []
    if risk_score > 60:
        last = df.iloc[-1]
        if last["Prev_Change"] < -2:
            reasons.append(f"yesterday dropped {last['Prev_Change']:.1f}%")
        if last["Prev_Change"] < -1:
            reasons.append("negative price movement")
        if last["Prev_Volume"] > df["Prev_Volume"].median() * 1.5:
            reasons.append("higher than normal volume")
        if not reasons:
            reasons.append("elevated crash probability from model")
    else:
        reasons.append("no major risk signals")
    return reasons


def get_agent1_result(stock: str):
    df = load_stock_csv(stock)
    df = prepare_features(df)
    if len(df) < 2:
        raise HTTPException(status_code=400, detail=f"Not enough data for {stock}")
    risk_score, is_danger = predict_risk(df)
    reasons = generate_reasons(df, risk_score)
    return risk_score, is_danger, reasons


def get_all_agent1_scores() -> dict:
    scores = {}
    for s in STOCKS:
        try:
            risk_score, _, _ = get_agent1_result(s)
            scores[s] = risk_score
        except Exception:
            scores[s] = 0
    return scores


# ---------- Combined verdict (used by /predict and /alert — cheap 3-signal version) ----------

def build_final_verdict(stock: str, final_score: float, agent2: dict, agent3: dict) -> str:
    level = "HIGH" if final_score > 60 else "MODERATE" if final_score > 30 else "LOW"
    causes = []
    if agent2["sentiment"] == "negative":
        causes.append("negative news")
    if agent3["contagion_risk"] == "high":
        causes.append("sector/family contagion risk")
    if not causes:
        causes.append("model risk signals")
    return f"{stock.upper()} is at {level} risk due to {' and '.join(causes)}"


def compute_final_score(agent1_score, agent2: dict, agent3: dict):
    final_score = (agent1_score * 0.5) + (agent2["risk_boost"] * 1.0) + (agent3["contagion_score"] * 0.3)
    final_score = float(round(min(100, final_score), 2))
    is_danger = bool(final_score > 60)
    return final_score, is_danger


# ---------- Routes ----------

@app.get("/")
def root():
    return {"message": "CrashRadar API is running"}


@app.get("/predict/{stock}")
def predict(stock: str):
    """Cheap 3-signal view: Agent 1 + Agent 2 (own stock only) + Agent 3. No live layer, no family news."""
    stock = stock.upper()

    try:
        agent1_score, agent1_danger, agent1_reasons = get_agent1_result(stock)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Stock '{stock}' not found")

    agent2 = get_news_sentiment(stock)

    all_scores = get_all_agent1_scores()
    agent3 = get_contagion_risk(stock, all_scores)

    final_score, is_danger = compute_final_score(agent1_score, agent2, agent3)
    verdict = build_final_verdict(stock, final_score, agent2, agent3)

    return {
        "stock": stock,
        "final_risk_score": final_score,
        "is_danger": is_danger,
        "agent1": {
            "risk_score": agent1_score,
            "reasons": agent1_reasons,
        },
        "agent2": {
            "sentiment": agent2["sentiment"],
            "conclusion": agent2["conclusion"],
            "articles": agent2["articles"][:3],
            "sources_used": agent2["sources_used"],
            "risk_boost": agent2["risk_boost"],
        },
        "agent3": {
            "contagion_risk": agent3["contagion_risk"],
            "affected_companies": agent3["affected_companies"],
            "explanation": agent3["explanation"],
            "sector": agent3["sector"],
        },
        "final_verdict": verdict,
    }


@app.get("/monitor/{stock}")
def monitor(stock: str):
    """
    Full CrashRadar engine — Agent 1 (historical), Live (intraday),
    Agent 2 (own + family/related news), and Agent 3 (contagion),
    combined into one final verdict.
    """
    try:
        return run_engine(stock, get_agent1_result, get_all_agent1_scores)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Stock '{stock}' not found")
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get("/stock/{stock}/family")
def stock_family(stock: str):
    """
    Exposes Agent 3's family/sector relationship data for a stock —
    parent company, subsidiaries, sector peers. Used by the dashboard
    to show contagion context.
    """
    stock = stock.upper()
    if stock not in STOCKS:
        raise HTTPException(status_code=404, detail=f"Stock '{stock}' not found")

    return get_stock_family(stock)


@app.get("/live/{stock}")
def live_risk(stock: str):
    try:
        return get_live_risk(stock)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get("/live/{stock}/replay")
def replay_risk(stock: str, at: str):
    """Example: /live/RELIANCE/replay?at=2026-07-21 10:30"""
    try:
        return get_replay_risk(stock, as_of=at)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


class AlertResponse(BaseModel):
    message: str
    alert_sent: bool


class AlertNote(BaseModel):
    note: str = ""


@app.post("/alert/{stock}", response_model=AlertResponse)
def alert(stock: str, body: AlertNote = AlertNote()):
    stock = stock.upper()

    try:
        result = run_engine(stock, get_agent1_result, get_all_agent1_scores)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Stock '{stock}' not found")
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    final_score = result["final_risk_score"]
    is_danger = result["is_danger"]

    if not is_danger:
        return AlertResponse(
            message=f"{stock} final risk score is {final_score} — below 60, no alert sent",
            alert_sent=False,
        )

    if not all([twilio_sid, twilio_token, twilio_from, twilio_to]):
        return AlertResponse(
            message=f"{stock} risk score is {final_score} — danger! But Twilio not configured in .env",
            alert_sent=False,
        )

    note_text = f"\nNote: {body.note}" if body.note else ""
    family_note_text = f"\n{result['agent2_family_note']}" if result.get("agent2_family_note") else ""

    message_body = (
        f"🚨 CrashRadar Alert\n"
        f"Stock: {stock}\n"
        f"Final Risk Score: {final_score}%\n"
        f"{result['final_verdict']}\n"
        f"Agent1: {', '.join(result['agent1']['reasons'])}\n"
        f"Live: {result['live_signal'].get('alert_level', 'LOW')}\n"
        f"Agent2 (News): {result['agent2']['conclusion']}"
        f"{family_note_text}\n"
        f"Agent3 (Contagion): {result['agent3']['explanation']}"
        f"{note_text}"
    )

    try:
        client = Client(twilio_sid, twilio_token)
        client.messages.create(
            body=message_body,
            from_=twilio_from,
            to=twilio_to,
        )
        return AlertResponse(
            message=f"Alert sent for {stock} (risk: {final_score}%)",
            alert_sent=True,
        )
    except Exception as e:
        return AlertResponse(
            message=f"Twilio error: {str(e)}",
            alert_sent=False,
        )


@app.get("/watchlist")
def watchlist():
    """
    Runs the full engine across all tracked stocks, sorted by risk
    descending. Used by the dashboard's main list view.
    """
    results = []
    failed = []

    for stock in STOCKS:
        try:
            result = run_engine(stock, get_agent1_result, get_all_agent1_scores)
            results.append(result)
        except Exception as e:
            print(f"[watchlist] Skipping {stock}: {e}")
            failed.append({"stock": stock, "error": str(e)})

    results.sort(key=lambda r: r["final_risk_score"], reverse=True)

    return {
        "stocks": results,
        "total_checked": len(STOCKS),
        "succeeded": len(results),
        "failed": failed,
    }