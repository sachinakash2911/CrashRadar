import os
import pickle
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from twilio.rest import Client
from dotenv import load_dotenv

load_dotenv()

MODEL_PATH = os.path.join(os.path.dirname(__file__), "crash_model.pkl")
DATA_DIR = os.path.dirname(__file__)

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

app = FastAPI(title="CrashRadar API", version="1.0")

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
    risk_score = round(proba * 100, 2)
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


@app.get("/")
def root():
    return {"message": "CrashRadar API is running"}


@app.get("/predict/{stock}")
def predict(stock: str):
    try:
        df = load_stock_csv(stock)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Stock '{stock}' not found")

    df = prepare_features(df)

    if len(df) < 2:
        raise HTTPException(status_code=400, detail="Not enough data to make prediction")

    risk_score, is_danger = predict_risk(df)
    reasons = generate_reasons(df, risk_score)

    return {
        "stock": stock.upper(),
        "risk_score": risk_score,
        "is_danger": is_danger,
        "reasons": reasons,
    }


class AlertResponse(BaseModel):
    message: str
    alert_sent: bool


class AlertNote(BaseModel):
    note: str = ""


@app.post("/alert/{stock}", response_model=AlertResponse)
def alert(stock: str, body: AlertNote = AlertNote()):
    try:
        df = load_stock_csv(stock)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Stock '{stock}' not found")

    df = prepare_features(df)

    if len(df) < 2:
        raise HTTPException(status_code=400, detail="Not enough data")

    risk_score, is_danger = predict_risk(df)

    if not is_danger:
        return AlertResponse(
            message=f"{stock.upper()} risk score is {risk_score} — below 60, no alert sent",
            alert_sent=False,
        )

    if not all([twilio_sid, twilio_token, twilio_from, twilio_to]):
        return AlertResponse(
            message=f"{stock.upper()} risk score is {risk_score} — danger! But Twilio not configured in .env",
            alert_sent=False,
        )

    reasons = generate_reasons(df, risk_score)
    note_text = f" Note: {body.note}" if body.note else ""
    message_body = (
        f"🚨 CrashRadar Alert\n"
        f"Stock: {stock.upper()}\n"
        f"Risk Score: {risk_score}%\n"
        f"Reasons: {', '.join(reasons)}{note_text}"
    )

    try:
        client = Client(twilio_sid, twilio_token)
        client.messages.create(
            body=message_body,
            from_=twilio_from,
            to=twilio_to,
        )
        return AlertResponse(
            message=f"Alert sent for {stock.upper()} (risk: {risk_score}%)",
            alert_sent=True,
        )
    except Exception as e:
        return AlertResponse(
            message=f"Twilio error: {str(e)}",
            alert_sent=False,
        )