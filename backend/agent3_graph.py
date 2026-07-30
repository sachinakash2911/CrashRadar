import yfinance as yf

FAMILIES = {
    "TATAMOTORS": {
        "children": [
            "TCS", "TITAN", "TATASTEEL", "TATAPOWER", "TATACHEM",
            "TATACOMM", "TATACONSUM", "TATAELXSI", "TRENT", "INDHOTEL"
        ]
    },
    "RELIANCE": {"children": ["JIOFIN", "NETWORK18"]},
    "ADANIENT": {
        "children": [
            "ADANIPORTS", "ADANIGREEN", "ADANIPOWER", "ADANIENSOL",
            "ATGL", "ADANIWILMAR", "AMBUJACEM", "ACC"
        ]
    },
    "HDFCBANK": {"children": ["HDFCLIFE", "HDFCAMC", "HDFCSEC"]},
    "ICICIBANK": {"children": ["ICICIGI", "ICICIPRULI", "ICICISEC"]},
    "BAJFINANCE": {"children": ["BAJAJFINSV", "BAJAJELEC", "BAJAJHFL", "BAJAJ-AUTO"]},
    "KOTAKBANK": {"children": ["KOTAKLIFE", "KOTAKMF"]},
    "AXISBANK": {"children": ["AXISCADES", "AXISLIFE"]},
    "MAHINDRA": {"children": ["M&M", "M&MFIN", "MAHINDCIE", "TECHM"]},
    "BIRLA": {"children": ["ULTRACEMCO", "GRASIM", "HINDALCO", "IDEA"]},
}

SECTORS = {

    "IT": ["TCS", "INFY", "WIPRO", "HCLTECH", "TECHM"],
    "OIL": ["ONGC", "RELIANCE"],
    "PHARMA": ["SUNPHARMA"],
    "BANK": ["HDFCBANK", "ICICIBANK", "SBIN", "KOTAKBANK", "AXISBANK"],
    "CEMENT": ["ULTRACEMCO", "GRASIM", "AMBUJACEM", "ACC"],
    "FMCG": ["HINDUNILVR", "ITC", "TATACONSUM"],
    "AUTO": ["MARUTI", "TITAN", "M&M", "BAJAJ-AUTO", "TATAMOTORS"],
    "INFRA": ["LT", "NTPC", "POWERGRID", "ADANIPORTS", "ADANIENT"],
    "ENERGY": ["ADANIGREEN", "ADANIPOWER", "ADANIENSOL", "ATGL", "ADANIENT"],
    "LOGISTICS": ["ADANIPORTS", "ADANIENT"],
}


STOCK_TO_FAMILY = {}
STOCK_TO_SECTOR = {}

for parent, data in FAMILIES.items():
    STOCK_TO_FAMILY[parent] = parent
    for child in data["children"]:
        STOCK_TO_FAMILY[child] = parent

for sector_name, members in SECTORS.items():
    for stock in members:
        STOCK_TO_SECTOR.setdefault(stock, []).append(sector_name)


def get_related_companies(stock: str) -> list:
    stock = stock.upper()
    related = set()

    family_parent = STOCK_TO_FAMILY.get(stock)
    if family_parent:
        if family_parent != stock:
            related.add(family_parent)
        for child in FAMILIES[family_parent]["children"]:
            if child != stock:
                related.add(child)

    sector_names = STOCK_TO_SECTOR.get(stock, [])
    for sector_name in sector_names:
        for peer in SECTORS[sector_name]:
            if peer != stock:
                related.add(peer)

    return sorted(related)


def _relation_type(company, stock, family_parent):
    if family_parent and company == family_parent:
        return "parent"
    if family_parent and company in FAMILIES[family_parent]["children"]:
        return "child"
    return "sector_peer"


def _get_live_price_change(ticker: str):
    try:
        data = yf.Ticker(f"{ticker}.NS").history(period="5d")
        if len(data) < 2:
            return None, "Live price data unavailable"
        prev_close = data["Close"].iloc[-2]
        last_close = data["Close"].iloc[-1]
        if prev_close is None or prev_close == 0 or prev_close != prev_close:  # catches 0 and NaN
            return None, "Live price data unavailable"
        pct = round(((last_close - prev_close) / prev_close) * 100, 2)
        if pct != pct:  # catches any remaining NaN
            return None, "Live price data unavailable"
        direction = "down" if pct < 0 else "up"
        return pct, f"Live price {direction} {abs(pct)}% today"
    except Exception:
        return None, "Live price data unavailable"

def _get_live_news(ticker: str):
    try:
        from agent2_news import get_news_sentiment  # deferred import — avoids circular import
        result = get_news_sentiment(ticker)
        sentiment = result.get("sentiment", "neutral")
        confidence = result.get("score", 50)  # 0-100, Agent 2's own confidence
        risk_boost = result.get("risk_boost", 0)

        # Convert sentiment + confidence into a 0-100 risk score.
        # Negative sentiment -> high risk. Positive -> low risk. Confidence scales how strongly.
        if sentiment == "negative":
            news_score = min(100, 50 + (confidence / 100) * 50)
        elif sentiment == "positive":
            news_score = max(0, 50 - (confidence / 100) * 50)
        else:
            news_score = 50

        news_score = round(news_score)
        headline = result.get("articles", [{}])[0].get("title", "")
        summary = f"News sentiment {sentiment} (confidence {confidence}/100)"
        if headline:
            summary += f' — "{headline[:60]}..."' if len(headline) > 60 else f' — "{headline}"'

        return news_score, summary
    except Exception:
        return None, "No significant news found"


def _price_to_score(pct_change):
    if pct_change is None:
        return None
    drop = max(0, -pct_change)
    return min(100, round(drop * 12))


def _compute_company_score(ticker: str, all_risk_scores: dict):
    if ticker in all_risk_scores:
        agent1_score = round(max(0, min(100, all_risk_scores[ticker])))
        _, price_text = _get_live_price_change(ticker)
        _, news_text = _get_live_news(ticker)
        reason = f"Model-based score from Agent 1 ({price_text}; {news_text})"
        return agent1_score, reason
    ...

    pct, price_text = _get_live_price_change(ticker)
    price_score = _price_to_score(pct)
    news_score, news_text = _get_live_news(ticker)

    scores = [s for s in (price_score, news_score) if s is not None]
    if not scores:
        return None, "No live data available — risk unknown"

    final_score = round(sum(scores) / len(scores))
    if len(scores) < 2:
        missing = "news" if news_score is None else "price"
        reason = f"{price_text}; {news_text} (partial data — {missing} signal unavailable)"
    else:
        reason = f"{price_text}; {news_text}"
    return final_score, reason


def score_to_risk_level(score):
    if score is None:
        return "UNKNOWN"
    if score < 25:
        return "LOW"
    elif score < 50:
        return "MODERATE"
    elif score < 75:
        return "HIGH"
    return "CRITICAL"


def get_contagion_risk(stock: str, all_risk_scores: dict) -> dict:
    stock = stock.upper()
    related = get_related_companies(stock)
    family_parent = STOCK_TO_FAMILY.get(stock)
    sector_name = STOCK_TO_SECTOR.get(stock)

    parent_score, parent_reason = _compute_company_score(stock, all_risk_scores)
    parent_company = {"ticker": stock, "risk_score": parent_score, "reason": parent_reason}

    if not related:
        return {
            "contagion_score": 0,
            "contagion_risk": "LOW",
            "sector": sector_name or "unknown",
            "parent_company": parent_company,
            "affected_companies": [],
            "conclusion": f"No known relationships found for {stock}."
        }

    from concurrent.futures import ThreadPoolExecutor

    def _score_one(company):
        score, reason = _compute_company_score(company, all_risk_scores)
        return {
            "ticker": company,
            "relation": _relation_type(company, stock, family_parent),
            "risk_score": score,
            "reason": reason
        }

    with ThreadPoolExecutor(max_workers=8) as executor:
        affected = list(executor.map(_score_one, related))

    known = [a["risk_score"] for a in affected if a["risk_score"] is not None]
    if known:
        avg_score = sum(known) / len(known)
        max_score = max(known)
        base_score = (0.4 * avg_score) + (0.6 * max_score)  # weight toward worst-case exposure
    else:
        base_score = 30  # neutral prior — no data at all, not zero

    unknown_ratio = (len(affected) - len(known)) / len(affected) if affected else 0
    uncertainty_penalty = unknown_ratio * 15

    contagion_score = round(min(100, base_score + uncertainty_penalty))
    contagion_risk = score_to_risk_level(contagion_score)

    worst = max(affected, key=lambda a: a["risk_score"] or -1, default=None)
    conclusion = f"{stock} shows {contagion_risk} contagion risk ({contagion_score}/100)."
    if worst and worst["risk_score"] is not None:
        conclusion += f" Driven mainly by {worst['ticker']} ({worst['relation']}, {worst['risk_score']}/100)."
    unknown_count = len(affected) - len(known)
    if unknown_count:
        conclusion += f" {unknown_count} of {len(affected)} related companies have no live data — treated as unknown, not safe."

    return {
        "contagion_score": contagion_score,
        "contagion_risk": contagion_risk,
        "sector": sector_name or "unknown",
        "parent_company": parent_company,
        "affected_companies": affected,
        "conclusion": conclusion
    }


def get_stock_family(stock: str) -> dict:
    stock = stock.upper()
    if stock not in STOCK_TO_FAMILY and stock not in STOCK_TO_SECTOR:
        raise ValueError(f"Unknown ticker: {stock}")

    family_parent = STOCK_TO_FAMILY.get(stock)
    sector_name = STOCK_TO_SECTOR.get(stock)

    if family_parent:
        children = [c for c in FAMILIES[family_parent]["children"] if c != stock]
        siblings = children
        parent = family_parent if family_parent != stock else None
    else:
        parent, children, siblings = None, [], []

    sector_members = [s for s in SECTORS[sector_name] if s != stock] if sector_name else []

    return {
        "stock": stock,
        "parent": parent,
        "children": children,
        "siblings": siblings,
        "sector": sector_name or "unknown",
        "sector_peers": sector_members,
        "all_related": get_related_companies(stock)
    }