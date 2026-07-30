import os
import re
import time
import requests
import feedparser
from difflib import SequenceMatcher
from urllib.parse import quote
from dotenv import load_dotenv
from dateutil import parser as date_parser
from datetime import datetime, timezone

from agent3_graph import get_related_companies

load_dotenv()

NEWS_API_KEY = os.getenv("NEWS_API_KEY")
NEWSDATA_API_KEY = os.getenv("NEWSDATA_API_KEY")

STOCKS = [
    "RELIANCE", "TCS", "INFY", "HDFCBANK", "ADANIENT",
    "WIPRO", "TITAN", "SBIN", "ICICIBANK", "KOTAKBANK",
    "AXISBANK", "BAJFINANCE", "HINDUNILVR", "MARUTI",
    "LT", "NTPC", "ONGC", "POWERGRID", "SUNPHARMA",
    "HCLTECH", "ITC", "ULTRACEMCO", "BHARTIARTL", "ASIANPAINT"
]

STOCK_FULL_NAMES = {
   "TCS": "Tata Consultancy Services",
    "ITC": "ITC Limited",
    "LT": "Larsen Toubro",
    "SBIN": "State Bank of India",
    "RELIANCE": "Reliance Industries",
    "HDFCBANK": "HDFC Bank",
    "ICICIBANK": "ICICI Bank",
    "KOTAKBANK": "Kotak Mahindra Bank",
    "AXISBANK": "Axis Bank",
    "BAJFINANCE": "Bajaj Finance",
    "HINDUNILVR": "Hindustan Unilever",
    "ADANIENT": "Adani Enterprises",
    "SUNPHARMA": "Sun Pharma",
    "HCLTECH": "HCL Technologies",
    "ULTRACEMCO": "UltraTech Cement",
    "BHARTIARTL": "Bharti Airtel",
    "ASIANPAINT": "Asian Paints",
    "WIPRO": "Wipro",
    "TITAN": "Titan Company",
    "INFY": "Infosys",
    "MARUTI": "Maruti Suzuki",
    "NTPC": "NTPC Limited",
    "ONGC": "Oil and Natural Gas Corporation",
    "POWERGRID": "Power Grid Corporation",
    "JIOFIN": "Jio Financial Services",
    "NETWORK18": "Network18 Media",
    "TV18BRDCST": "TV18 Broadcast",
    "TATASTEEL": "Tata Steel",
    "TATAPOWER": "Tata Power",
    "TATACHEM": "Tata Chemicals",
    "TATACOMM": "Tata Communications",
    "TATACONSUM": "Tata Consumer Products",
    "TATAELXSI": "Tata Elxsi",
    "TRENT": "Trent Limited",
    "INDHOTEL": "Indian Hotels Company",
    "TATAMOTORS": "Tata Motors",
    "ADANIPORTS": "Adani Ports",
    "ADANIGREEN": "Adani Green Energy",
    "ADANIPOWER": "Adani Power",
    "ADANIENSOL": "Adani Energy Solutions",
    "ATGL": "Adani Total Gas",
    "ADANIWILMAR": "Adani Wilmar",
    "AMBUJACEM": "Ambuja Cements",
    "ACC": "ACC Limited",
    "HDFCLIFE": "HDFC Life Insurance",
    "HDFCAMC": "HDFC Asset Management",
    "HDFCSEC": "HDFC Securities",
    "ICICIGI": "ICICI Lombard",
    "ICICIPRULI": "ICICI Prudential Life Insurance",
    "ICICISEC": "ICICI Securities",
    "BAJAJFINSV": "Bajaj Finserv",
    "BAJAJELEC": "Bajaj Electricals",
    "BAJAJHFL": "Bajaj Housing Finance",
    "BAJAJ-AUTO": "Bajaj Auto",
    "KOTAKLIFE": "Kotak Mahindra Life Insurance",
    "KOTAKMF": "Kotak Mahindra Mutual Fund",
    "AXISCADES": "Axiscades Technologies",
    "AXISLIFE": "Axis Max Life Insurance",
    "M&M": "Mahindra and Mahindra",
    "M&MFIN": "Mahindra Finance",
    "MAHINDCIE": "Mahindra CIE Automotive",
    "TECHM": "Tech Mahindra",
    "GRASIM": "Grasim Industries",
    "HINDALCO": "Hindalco Industries",
    "IDEA": "Vodafone Idea",
}

COMPANY_EXCLUDE_TERMS = {
    "RELIANCE": [
        "reliance infra", "reliance power", "reliance capital",
        "reliance home finance", "reliance naval", "anil ambani",
        "reliance communications", "reliance industrial infrastructure",
    ],
    "BAJFINANCE": [
        "bajaj auto", "bajaj finserv", "bajaj holdings", "bajaj electricals",
        "bajaj hindusthan",
    ],
    "ADANIENT": [
        "adani power", "adani ports", "adani green", "adani transmission",
        "adani total gas", "adani wilmar", "adani energy",
    ],
    "TITAN": [
        "titan machinery",
    ],
}

MAX_ARTICLE_AGE_DAYS = 45

NEGATIVE_WORDS = [
    "crash", "fall", "drop", "loss", "down", "risk", "fraud", "scam", "debt", "bankrupt",
    "sell", "weak", "slump", "tumble", "plunge", "decline", "warning", "bearish",
    "underperform", "cut", "reduce", "miss", "downgrade", "penalty", "probe",
    "investigation", "worst", "fear", "panic", "crisis", "damaged"
]

POSITIVE_WORDS = [
    "rise", "gain", "up", "profit", "growth", "strong", "buy", "high", "record", "surge",
    "rally", "boost", "jump", "soar", "climb", "beat", "positive", "bullish", "outperform",
    "upgrade", "dividend", "bonus", "launch", "expansion", "partnership", "award",
    "approval", "breakout", "recovery", "leading", "momentum"
]

# PATCH 5: negation/contrast cues. If one of these phrases appears right before
# a negative word, we treat that occurrence as neutral/weakened rather than
# fully negative — handles cases like "rises despite market crash fears".
NEGATION_CUES = ["despite", "beats", "better than", "outperforms", "shrugs off", "overcomes"]

# PATCH 1: simple in-memory TTL cache. Keeps /monitor and /watchlist from
# re-hitting 3 external APIs per stock on every call within a short window.
_CACHE = {}
CACHE_TTL_SECONDS = 300  # 5 minutes — fresh enough for a live demo, saves quota


def _cache_get(key):
    entry = _CACHE.get(key)
    if entry and (time.time() - entry["ts"]) < CACHE_TTL_SECONDS:
        return entry["value"]
    return None


def _cache_set(key, value):
    _CACHE[key] = {"value": value, "ts": time.time()}


def _parse_date(raw: str):
    if not raw:
        return None
    try:
        dt = date_parser.parse(raw)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except Exception:
        return None


def _format_display_time(dt) -> str:
    if dt is None:
        return "Unknown time"
    return dt.strftime("%d %b %Y, %I:%M %p UTC")


def _recency_weight(dt, half_life_days: float = 7.0) -> float:
    if dt is None:
        return 0.5
    age_days = (datetime.now(timezone.utc) - dt).total_seconds() / 86400
    age_days = max(age_days, 0)
    return 0.5 ** (age_days / half_life_days)


def _filter_recent(items: list) -> list:
    """Drop articles older than MAX_ARTICLE_AGE_DAYS; keep items with unparseable dates."""
    now = datetime.now(timezone.utc)
    recent = []
    for item in items:
        dt = item.get("published_dt")
        if dt is None:
            recent.append(item)
            continue
        age_days = (now - dt).total_seconds() / 86400
        if age_days <= MAX_ARTICLE_AGE_DAYS:
            recent.append(item)
    return recent


# PATCH 3: strip trailing " - PublisherName" that Google News RSS appends,
# so dedup matching and sentiment scoring work on the real headline only.
def _clean_title(title: str) -> str:
    return re.sub(r"\s*-\s*[A-Za-z0-9.]+(\.[a-z]{2,})?$", "", title).strip()


# ---------- Source 1: Google News RSS ----------

def fetch_google_news(stock: str, max_results: int = 12) -> list:
    query_term = STOCK_FULL_NAMES.get(stock.upper(), stock)
    query = quote(f"{query_term} share price NSE when:7d")
    url = f"https://news.google.com/rss/search?q={query}&hl=en-IN&gl=IN&ceid=IN:en"
    try:
        # PATCH 2: fetch via requests (timeout + User-Agent) instead of letting
        # feedparser make its own unmanaged, un-timed-out request.
        resp = requests.get(
            url, timeout=6,
            headers={"User-Agent": "Mozilla/5.0 (compatible; CrashRadarBot/1.0)"}
        )
        feed = feedparser.parse(resp.content)
        results = []
        for entry in feed.entries[:max_results]:
            src = "Google News"
            if hasattr(entry, "source") and entry.source.get("title"):
                src = entry.source.title
            results.append({
                "title": _clean_title(entry.get("title", "")),
                "source": src,
                "published_raw": entry.get("published", ""),
                "url": entry.get("link", ""),
                "origin": "google_rss",
            })
        return results
    except Exception:
        return []


# ---------- Source 2: NewsAPI ----------

def fetch_newsapi(stock: str, max_results: int = 8) -> list:
    if not NEWS_API_KEY:
        return []
    query_term = STOCK_FULL_NAMES.get(stock.upper(), stock)
    try:
        url = (
            f"https://newsapi.org/v2/everything"
            f"?q=\"{query_term}\"+india+share&language=en&pageSize={max_results}"
            f"&sortBy=publishedAt&apiKey={NEWS_API_KEY}"
        )
        resp = requests.get(url, timeout=6)
        data = resp.json()
        if data.get("status") != "ok" or not data.get("articles"):
            return []
        results = []
        for a in data["articles"]:
            if a.get("title"):
                results.append({
                    "title": _clean_title(a["title"]),
                    "source": a.get("source", {}).get("name", "NewsAPI"),
                    "published_raw": a.get("publishedAt", ""),
                    "url": a.get("url", ""),
                    "origin": "newsapi",
                })
        return results
    except Exception:
        return []


# ---------- Source 3: NewsData.io ----------

def fetch_newsdata(stock: str, max_results: int = 8) -> list:
    if not NEWSDATA_API_KEY:
        return []
    query_term = STOCK_FULL_NAMES.get(stock.upper(), stock)
    try:
        url = (
            f"https://newsdata.io/api/1/news"
            f"?apikey={NEWSDATA_API_KEY}&q={quote(query_term)}&country=in&language=en&category=business"
        )
        resp = requests.get(url, timeout=6)
        data = resp.json()
        if data.get("status") != "success" or not data.get("results"):
            return []
        results = []
        for a in data["results"][:max_results]:
            title = a.get("title")
            if title:
                results.append({
                    "title": _clean_title(title),
                    "source": a.get("source_id", "NewsData.io"),
                    "published_raw": a.get("pubDate", ""),
                    "url": a.get("link", ""),
                    "origin": "newsdata",
                })
        return results
    except Exception:
        return []


# ---------- Relevance filter with collision guard ----------

def filter_relevant(headlines: list, stock: str) -> list:
    stock = stock.upper()
    query_term = STOCK_FULL_NAMES.get(stock, stock).lower()
    exclude_terms = COMPANY_EXCLUDE_TERMS.get(stock, [])

    relevant = []
    for h in headlines:
        title_lower = h["title"].lower()
        if stock.lower() not in title_lower and query_term not in title_lower:
            continue
        if any(bad in title_lower for bad in exclude_terms):
            continue
        relevant.append(h)
    return relevant


# ---------- Merge, fuzzy dedupe, cross-verify ----------

def _titles_similar(a: str, b: str, threshold: float = 0.6) -> bool:
    return SequenceMatcher(None, a, b).ratio() >= threshold


def merge_and_score_sources(*source_lists) -> list:
    all_items = [item for source_list in source_lists for item in source_list if item.get("title")]

    clusters = []  # [{"title_norm": str, "items": [...]}]
    for item in all_items:
        title_norm = item["title"].lower().strip()
        placed = False
        for cluster in clusters:
            if _titles_similar(title_norm, cluster["title_norm"]):
                cluster["items"].append(item)
                placed = True
                break
        if not placed:
            clusters.append({"title_norm": title_norm, "items": [item]})

    merged = []
    for cluster in clusters:
        best = max(cluster["items"], key=lambda i: len(i["title"]))
        best["published_dt"] = _parse_date(best["published_raw"])
        best["published_display"] = _format_display_time(best["published_dt"])
        merged.append(best)

    return merged


# ---------- Sentiment scoring (recency-weighted, negation-aware, volume-aware) ----------

def _count_words_with_negation_guard(title_lower: str, word_list: list, is_negative: bool) -> float:
    """
    Counts occurrences of words from word_list in title_lower.
    For negative words specifically, if a negation cue appears anywhere in
    the same title, weaken (not eliminate) each negative hit — handles
    "rises despite crash fears" style headlines without needing real NLP.
    """
    count = title_lower.count.__self__ and sum(title_lower.count(w) for w in word_list)
    if is_negative and count > 0:
        if any(cue in title_lower for cue in NEGATION_CUES):
            count *= 0.4  # weaken, don't zero out — still slightly relevant
    return count


def _compute_sentiment(items: list):
    if not items:
        return "neutral", 0, 0
    score = 90.0
    for item in items:
        title = item["title"].lower()
        rw = _recency_weight(item.get("published_dt"))
        neg_hits = 0
        pos_hits = 0
        for w in NEGATIVE_WORDS:
            count = title.count(w)
            if count > 0:
                if any(nc in title for nc in NEGATION_CUES):
                    count *= 0.4
                neg_hits += count
        for w in POSITIVE_WORDS:
            pos_hits += title.count(w)
        score -= neg_hits * 7.0 * rw
        score += pos_hits * 1.5 * rw
    score = max(0.0, min(100.0, score))
    if score >= 70:
        sentiment = "positive"
    elif score >= 40:
        sentiment = "neutral"
    else:
        sentiment = "negative"
    risk_boost = min(30, int(((100 - score) / 100) * 30))
    return sentiment, round(score, 2), risk_boost


def _build_conclusion(items: list, stock: str, sentiment: str, risk_boost: int, score) -> str:
    if not items:
        return f"No recent news found for {stock}."
    total = len(items)
    latest = items[0]
    mood_phrase = {"positive": "largely positive", "negative": "leaning negative", "neutral": "mixed/neutral"}[sentiment]
    conclusion = (
        f"Based on {total} recent articles from {len(set(i['source'] for i in items))} sources, "
        f"news sentiment for {stock} is {mood_phrase} (confidence: {score}/100)"
    )
    conclusion += f". Most recent: \"{latest['title']}\" ({latest['source']}, {latest['published_display']})."
    if risk_boost > 0:
        conclusion += f" Risk boost applied: +{risk_boost}/30."
    return conclusion


# ---------- Main entry point (single stock, cached) ----------

def get_news_sentiment(stock: str, use_cache: bool = True) -> dict:
    stock = stock.upper()
    if use_cache:
        cached = _cache_get(f"news:{stock}")
        if cached is not None:
            return cached

    google_results = filter_relevant(fetch_google_news(stock), stock)
    newsapi_results = filter_relevant(fetch_newsapi(stock), stock)
    newsdata_results = filter_relevant(fetch_newsdata(stock), stock)

    merged = merge_and_score_sources(google_results, newsapi_results, newsdata_results)
    merged = _filter_recent(merged)

    if not merged:
        result = {
            "sentiment": "neutral", "score": 0, "articles": [],
            "sources_used": [],
            "conclusion": f"No headlines specifically mentioning {stock} found",
            "risk_boost": 0
        }
        _cache_set(f"news:{stock}", result)
        return result

    merged.sort(
        key=lambda x: x["published_dt"] if x["published_dt"] else datetime.min.replace(tzinfo=timezone.utc),
        reverse=True
    )

    sentiment, score, risk_boost = _compute_sentiment(merged)
    sources_used = sorted(set(i["source"] for i in merged))
    conclusion = _build_conclusion(merged, stock, sentiment, risk_boost, score)

    articles_out = [
        {
            "title": i["title"],
            "source": i["source"],
            "published_at": i["published_display"],
            "published_raw": i["published_raw"],
            "url": i["url"],
        }
        for i in merged[:8]
    ]

    result = {
        "sentiment": sentiment,
        "score": score,
        "articles": articles_out,
        "sources_used": sources_used,
        "conclusion": conclusion,
        "risk_boost": risk_boost
    }
    _cache_set(f"news:{stock}", result)
    return result


# ---------- Family-aware version (cached, so repeated /monitor calls are cheap) ----------

def get_family_news_sentiment(stock: str, max_related: int = 5) -> dict:
    stock = stock.upper()
    own_result = get_news_sentiment(stock)

    related = get_related_companies(stock)[:max_related]
    related_results = {}

    for company in related:
        try:
            related_results[company] = get_news_sentiment(company)
        except Exception:
            continue

    family_negative_flags = [
        company for company, result in related_results.items()
        if result["sentiment"] == "negative"
    ]

    family_risk_note = None
    if family_negative_flags:
        names = ", ".join(family_negative_flags)
        family_risk_note = (
            f"⚠ Related compan{'ies' if len(family_negative_flags) > 1 else 'y'} "
            f"{names} showing negative news sentiment — possible contagion risk for {stock}"
        )

    return {
        "stock": stock,
        "own_news": own_result,
        "related_companies_checked": related,
        "related_news": related_results,
        "family_risk_note": family_risk_note,
    }


def get_all_stocks_sentiment() -> dict:
    results = {}
    for stock in STOCKS:
        results[stock] = get_news_sentiment(stock)
    return results