"""
CrashRadar Core Engine
Combines all 4 signals into one final risk verdict:
  1. Agent 1  — Historical/daily ML model (XGBoost)
  2. Live     — Real-time intraday anomaly detection
  3. Agent 2  — News sentiment (own stock + family/related companies)
  4. Agent 3  — Contagion / knowledge graph risk
"""

from live_monitor import get_live_risk
from agent2_news import get_family_news_sentiment
from agent3_graph import get_contagion_risk

LIVE_LEVEL_TO_SCORE = {"LOW": 0, "MODERATE": 50, "HIGH": 100}

WEIGHTS = {
    "agent1": 0.4,
    "agent2": 1.0,   # applied to risk_boost, already scaled 0-30
    "agent3": 0.2,
    "live":   0.3,
}

FAMILY_NEWS_EXTRA_BOOST = 5
DANGER_THRESHOLD = 60


def compute_final_score(agent1_score, agent2: dict, agent3: dict, live: dict):
    live_score = LIVE_LEVEL_TO_SCORE.get(live.get("alert_level", "LOW"), 0)

    final_score = (
        (agent1_score * WEIGHTS["agent1"]) +
        (agent2["risk_boost"] * WEIGHTS["agent2"]) +
        (agent3["contagion_score"] * WEIGHTS["agent3"]) +
        (live_score * WEIGHTS["live"])
    )
    final_score = float(round(min(100, final_score), 2))
    is_danger = bool(final_score > DANGER_THRESHOLD)
    return final_score, is_danger


def build_verdict(stock: str, final_score: float, agent2: dict, agent3: dict, live: dict) -> str:
    level = "HIGH" if final_score > 60 else "MODERATE" if final_score > 30 else "LOW"
    causes = []
    if live.get("alert_level") in ("MODERATE", "HIGH"):
        causes.append("live intraday anomaly")
    if agent2["sentiment"] == "negative":
        causes.append("negative news")
    if agent3["contagion_risk"] == "high":
        causes.append("sector/family contagion risk")
    if not causes:
        causes.append("model risk signals")
    return f"{stock.upper()} is at {level} risk due to {' and '.join(causes)}"


def run_engine(stock: str, get_agent1_result, get_all_agent1_scores) -> dict:
    stock = stock.upper()

    # 1. Historical model
    agent1_score, agent1_danger, agent1_reasons = get_agent1_result(stock)

    # 2. Live intraday signal
    live = get_live_risk(stock)

    # 3. News sentiment — own stock + related family companies
    family_news = get_family_news_sentiment(stock)
    agent2 = dict(family_news["own_news"])  # copy so we don't mutate the original

    if family_news["family_risk_note"]:
        agent2["risk_boost"] = min(30, agent2["risk_boost"] + FAMILY_NEWS_EXTRA_BOOST)

    # 4. Contagion / knowledge graph
    all_scores = get_all_agent1_scores()
    agent3 = get_contagion_risk(stock, all_scores)

    # Combine
    final_score, is_danger = compute_final_score(agent1_score, agent2, agent3, live)
    verdict = build_verdict(stock, final_score, agent2, agent3, live)

    return {
        "stock": stock,
        "final_risk_score": final_score,
        "is_danger": is_danger,
        "final_verdict": verdict,
        "alert_window_minutes": 15 if is_danger else None,
        "live_signal": live,
        "agent1": {"risk_score": agent1_score, "reasons": agent1_reasons},
        "agent2": agent2,
        "agent2_family_note": family_news["family_risk_note"],
        "agent2_related_checked": family_news["related_companies_checked"],
        "agent3": agent3,
    }