import yfinance as yf
import pandas as pd
from datetime import datetime
from nsetools import Nse

nse = Nse()

# yfinance limitation: 5-minute intraday data is only available for
# roughly the last 60 days. Fine for replay demos of recent events.
INTERVAL = "5m"
LOOKBACK_PERIOD = "5d"

PRICE_DROP_THRESHOLD = -1.0
VOLUME_SPIKE_MULTIPLIER = 2.0
ACCEL_BARS = 3


def fetch_intraday(stock: str) -> pd.DataFrame:
    """Used for replay mode and as yfinance fallback for live mode."""
    ticker = f"{stock.upper()}.NS"
    df = yf.download(ticker, period=LOOKBACK_PERIOD, interval=INTERVAL, progress=False)
    if df.empty:
        raise ValueError(f"No intraday data available for {stock}")
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)
    df = df.dropna(subset=["Close"])
    return df


import time

def fetch_nse_quote(stock: str, retries: int = 3) -> dict:
    last_error = None
    for attempt in range(retries):
        try:
            quote = nse.get_quote(stock.upper())
            if quote:
                return {
                    "last_price": quote.get("lastPrice"),
                    "change_pct": quote.get("pChange"),
                    "volume": quote.get("totalTradedVolume") or quote.get("quantityTraded", 0),
                    "timestamp": quote.get("lastUpdateTime", str(datetime.now())),
                }
        except Exception as e:
            last_error = e
            time.sleep(1.5)  # brief pause before retry
    raise ValueError(f"nsetools failed after {retries} attempts: {last_error}")


def analyze_window(df: pd.DataFrame, as_of: str = None) -> dict:
    if as_of:
        target_time = pd.Timestamp(as_of)
        if df.index.tz is not None and target_time.tz is None:
            target_time = target_time.tz_localize(df.index.tz)
        df = df[df.index <= target_time]

    if len(df) < ACCEL_BARS + 1:
        return {"status": "insufficient_data", "message": "Not enough intraday bars"}

    window = df.tail(15)
    start_price = window["Close"].iloc[0]
    latest_price = window["Close"].iloc[-1]
    price_change_pct = round(((latest_price - start_price) / start_price) * 100, 2)

    avg_volume = window["Volume"].iloc[:-1].mean()
    latest_volume = window["Volume"].iloc[-1]
    volume_ratio = round(latest_volume / avg_volume, 2) if avg_volume > 0 else 0

    recent_changes = window["Close"].pct_change().tail(ACCEL_BARS) * 100
    accelerating = bool(
        len(recent_changes.dropna()) == ACCEL_BARS
        and all(recent_changes.iloc[i] <= recent_changes.iloc[i - 1] for i in range(1, ACCEL_BARS))
        and recent_changes.iloc[-1] < 0
    )

    reasons = []
    risk_flags = 0
    if price_change_pct <= PRICE_DROP_THRESHOLD:
        reasons.append(f"price dropped {price_change_pct}% in the last ~75 minutes")
        risk_flags += 1
    if volume_ratio >= VOLUME_SPIKE_MULTIPLIER:
        reasons.append(f"volume spiked {volume_ratio}x normal levels")
        risk_flags += 1
    if accelerating:
        reasons.append("price decline is accelerating bar-over-bar")
        risk_flags += 1

    if risk_flags >= 2:
        alert_level = "HIGH"
    elif risk_flags == 1:
        alert_level = "MODERATE"
    else:
        alert_level = "LOW"
        reasons.append("no unusual intraday movement detected")

    return {
        "status": "ok",
        "as_of": str(window.index[-1]),
        "price_change_pct": price_change_pct,
        "volume_ratio": volume_ratio,
        "accelerating_decline": accelerating,
        "alert_level": alert_level,
        "reasons": reasons,
    }


def get_live_risk(stock: str) -> dict:
    """
    Tries nsetools first (closer to real-time NSE quotes).
    Falls back to yfinance intraday bars if nsetools fails.
    """
    try:
        quote = fetch_nse_quote(stock)
        change_pct = quote["change_pct"] or 0

        reasons = []
        risk_flags = 0
        if change_pct <= PRICE_DROP_THRESHOLD:
            reasons.append(f"price down {change_pct}% today")
            risk_flags += 1
        if not reasons:
            reasons.append("no unusual movement detected")

        alert_level = "HIGH" if risk_flags >= 2 else "MODERATE" if risk_flags == 1 else "LOW"

        return {
            "status": "ok",
            "source": "nsetools",
            "as_of": quote["timestamp"],
            "last_price": quote["last_price"],
            "price_change_pct": change_pct,
            "alert_level": alert_level,
            "reasons": reasons,
            "mode": "live",
            "stock": stock.upper(),
        }

    except Exception as e:
        # Fallback to yfinance
        df = fetch_intraday(stock)
        result = analyze_window(df, as_of=None)
        result["source"] = "yfinance_fallback"
        result["fallback_reason"] = str(e)
        result["mode"] = "live"
        result["stock"] = stock.upper()
        return result


def get_replay_risk(stock: str, as_of: str) -> dict:
    """Replay mode always uses yfinance (nsetools has no historical data)."""
    df = fetch_intraday(stock)
    result = analyze_window(df, as_of=as_of)
    result["source"] = "yfinance"
    result["mode"] = "replay"
    result["stock"] = stock.upper()
    result["requested_time"] = as_of
    return result