import os
import concurrent.futures
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from twilio.rest import Client
from dotenv import load_dotenv

from agent1_model import get_agent1_result as run_agent1_func
from agent2_news import get_news_sentiment
from agent3_graph import get_contagion_risk, get_stock_family
from live_monitor import get_live_risk, get_replay_risk
from engine import run_engine

load_dotenv()

app = FastAPI(title="CrashRadar API", version="3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    from agent1_model import load_model_once, precompute_all_stocks
    print("Loading model...")
    load_model_once()
    print("Precomputing all stocks...")
    precompute_all_stocks()
    print("CrashRadar API ready!")


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


# ---------- Agent wrappers with fallbacks ----------

def run_agent1(stock):
    try:
        return run_agent1_func(stock.upper())
    except Exception as e:
        return {
            "risk_score": 0,
            "is_danger": False,
            "shap_reasons": ["Agent 1 error"],
            "plain_english": str(e),
            "price_proximity": {},
            "live_monitor": {},
        }


def run_agent2(stock):
    try:
        return get_news_sentiment(stock.upper())
    except Exception as e:
        return {
            "sentiment": "neutral",
            "score": 0,
            "risk_boost": 0,
            "risk_reduction": 0,
            "summary": str(e),
        }


def run_agent3(stock, score):
    try:
        return get_contagion_risk(stock.upper(), {stock.upper(): score})
    except Exception as e:
        return {
            "contagion_risk": "low",
            "contagion_score": 0,
            "explanation": str(e),
        }


# ---------- Adapter for engine.py ----------

def get_agent1_result_adapter(stock: str):
    result = run_agent1_func(stock)
    return result["risk_score"], result["is_danger"], result["shap_reasons"]


def get_all_agent1_scores() -> dict:
    scores = {}
    for s in STOCKS:
        try:
            result = run_agent1_func(s)
            scores[s] = result["risk_score"]
        except Exception:
            scores[s] = 0
    return scores


# ---------- Routes ----------

@app.get("/")
def root():
    return {"message": "CrashRadar API is running"}


@app.get("/predict/{stock}")
def predict(stock: str):
    stock = stock.upper()

    with concurrent.futures.ThreadPoolExecutor() as executor:
        future_agent1 = executor.submit(run_agent1, stock)
        future_agent2 = executor.submit(run_agent2, stock)

        agent1_result = future_agent1.result(timeout=30)
        agent2_result = future_agent2.result(timeout=10)

    agent1_score = agent1_result.get("risk_score", 0)
    agent1_danger = agent1_result.get("is_danger", False)
    agent3_result = run_agent3(stock, agent1_score)

    agent2_boost = agent2_result.get("risk_boost", 0)
    agent2_reduction = agent2_result.get("risk_reduction", 0)
    news_impact = agent2_boost - agent2_reduction
    agent3_score = agent3_result.get("contagion_score", 0)

    final_score = (
        agent1_score * 0.60 +
        news_impact * 0.25 +
        agent3_score * 0.15
    )

    if agent1_danger and final_score < 40:
        final_score = 40

    final_score = min(100, max(0, round(final_score, 2)))
    is_danger = final_score > 55

    if final_score >= 70:
        risk_level = "HIGH"
        verdict = f"{stock} is at HIGH risk — {agent1_result.get('plain_english', '')[:100]}"
    elif final_score >= 55:
        risk_level = "ELEVATED"
        verdict = f"{stock} shows ELEVATED risk — monitoring recommended"
    elif final_score >= 40:
        risk_level = "MODERATE"
        verdict = f"{stock} shows MODERATE risk — watch closely"
    else:
        risk_level = "LOW"
        verdict = f"{stock} is at LOW risk — normal market conditions"

    return {
        "stock": stock,
        "final_risk_score": final_score,
        "risk_level": risk_level,
        "is_danger": is_danger,
        "final_verdict": verdict,
        "agent1": agent1_result,
        "agent2": agent2_result,
        "agent3": agent3_result,
        "score_breakdown": {
            "agent1_contribution": round(agent1_score * 0.60, 2),
            "news_contribution": round(news_impact * 0.25, 2),
            "contagion_contribution": round(agent3_score * 0.15, 2),
            "formula": "Agent1(60%) + News(25%) + Contagion(15%)",
        },
        "live_data": {
            "current_price": agent1_result.get("price_proximity", {}).get("current_price"),
            "as_of": agent1_result.get("live_monitor", {}).get("fetched_at"),
        },
    }


@app.get("/monitor/{stock}")
def monitor(stock: str):
    try:
        return run_engine(stock, get_agent1_result_adapter, get_all_agent1_scores)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Stock '{stock}' not found")
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get("/stock/{stock}/family")
def stock_family(stock: str):
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
        result = run_engine(stock, get_agent1_result_adapter, get_all_agent1_scores)
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
        f"CrashRadar Alert\n"
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
    results = []
    failed = []

    for stock in STOCKS:
        try:
            result = run_engine(stock, get_agent1_result_adapter, get_all_agent1_scores)
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
