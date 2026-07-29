# Graph schema designed for Neo4j Aura
# Using local mirror for demo stability

FAMILIES = {
    "TATAMOTORS": {  # Tata Group
        "children": [
            "TCS", "TITAN", "TATASTEEL", "TATAPOWER", "TATACHEM",
            "TATACOMM", "TATACONSUM", "TATAELXSI", "TRENT", "INDHOTEL"
        ]
    },
    "RELIANCE": {
        "children": ["JIOFINANCE", "NETWORK18", "TV18BRDCST"]
    },
    "ADANIENT": {
        "children": [
            "ADANIPORTS", "ADANIGREEN", "ADANIPOWER", "ADANIENSOL",
            "ATGL", "ADANIWILMAR", "AMBUJACEM", "ACC"
        ]
    },
    "HDFCBANK": {
        "children": ["HDFCLIFE", "HDFCAMC", "HDFCSEC"]
    },
    "ICICIBANK": {
        "children": ["ICICIGI", "ICICIPRULI", "ICICISEC"]
    },
    "BAJFINANCE": {
        "children": ["BAJAJFINSV", "BAJAJELEC", "BAJAJHFL", "BAJAJ-AUTO"]
    },
    "KOTAKBANK": {
        "children": ["KOTAKLIFE", "KOTAKMF"]
    },
    "AXISBANK": {
        "children": ["AXISCADES", "AXISLIFE"]
    },
    "MAHINDRA": {
        "children": ["M&M", "M&MFIN", "MAHINDCIE", "TECHM"]
    },
    "BIRLA": {
        "children": ["ULTRACEMCO", "GRASIM", "HINDALCO", "IDEA"]
    },
}

SECTORS = {
    "IT": ["TCS", "INFY", "WIPRO", "HCLTECH", "TECHM"],
    "OIL": ["ONGC", "RELIANCE"],
    "PHARMA": ["SUNPHARMA"],
    "BANK": ["HDFCBANK", "ICICIBANK", "SBIN", "KOTAKBANK", "AXISBANK"],
    "CEMENT": ["ULTRACEMCO", "GRASIM", "AMBUJACEM", "ACC"],
    "FMCG": ["HINDUNILVR", "ITC", "TATACONSUM"],
    "AUTO": ["MARUTI", "TITAN", "M&M", "BAJAJ-AUTO", "TATAMOTORS"],
    "INFRA": ["LT", "NTPC", "POWERGRID"],
}

STOCK_TO_FAMILY = {}
STOCK_TO_SECTOR = {}

for parent, data in FAMILIES.items():
    STOCK_TO_FAMILY[parent] = parent
    for child in data["children"]:
        STOCK_TO_FAMILY[child] = parent

for sector_name, members in SECTORS.items():
    for stock in members:
        STOCK_TO_SECTOR[stock] = sector_name


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

    sector_name = STOCK_TO_SECTOR.get(stock)
    if sector_name:
        for peer in SECTORS[sector_name]:
            if peer != stock:
                related.add(peer)

    return sorted(related)


def get_contagion_risk(stock: str, all_risk_scores: dict) -> dict:
    stock = stock.upper()
    related = get_related_companies(stock)
    family_parent = STOCK_TO_FAMILY.get(stock)
    sector_name = STOCK_TO_SECTOR.get(stock)

    if not related:
        return {
            "contagion_risk": "low",
            "contagion_score": 0,
            "affected_companies": [],
            "explanation": f"No known relationships found for {stock}",
            "sector": sector_name or "unknown"
        }

    affected = []
    high_risk_parents = []
    high_risk_children = []
    high_risk_sector = []
    medium_risk = []

    for company in related:
        score = all_risk_scores.get(company, 0)
        if score > 70:
            affected.append(company)
            if family_parent and company == family_parent:
                high_risk_parents.append(company)
            elif family_parent and company in FAMILIES[family_parent]["children"]:
                high_risk_children.append(company)
            else:
                high_risk_sector.append(company)
        elif score > 50:
            affected.append(company)
            medium_risk.append(company)

    if high_risk_parents:
        contagion_score = min(100, 70 + len(high_risk_parents) * 10)
        contagion_risk = "high"
        parent_names = ", ".join(high_risk_parents)
        explanation = f"Parent company {parent_names} is also at high risk, contagion likely"
    elif high_risk_children:
        contagion_score = min(100, 60 + len(high_risk_children) * 10)
        contagion_risk = "high"
        child_names = ", ".join(high_risk_children)
        explanation = f"Subsidiary {child_names} is also at high risk, financial stress may spread"
    elif high_risk_sector:
        contagion_score = min(100, 55 + len(high_risk_sector) * 10)
        contagion_risk = "high"
        sector_names = ", ".join(high_risk_sector)
        explanation = f"Sector peers {sector_names} in {sector_name or 'same sector'} are at high risk, sector-wide contagion possible"
    elif medium_risk:
        contagion_score = 30 + len(medium_risk) * 10
        contagion_risk = "medium"
        names = ", ".join(medium_risk)
        explanation = f"Related companies {names} showing moderate risk, monitor closely"
    else:
        contagion_score = 0
        contagion_risk = "low"
        explanation = f"All related companies ({', '.join(related)}) have low risk scores"

    return {
        "contagion_risk": contagion_risk,
        "contagion_score": contagion_score,
        "affected_companies": affected,
        "explanation": explanation,
        "sector": sector_name or "unknown"
    }


def get_stock_family(stock: str) -> dict:
    stock = stock.upper()
    family_parent = STOCK_TO_FAMILY.get(stock)
    sector_name = STOCK_TO_SECTOR.get(stock)

    if family_parent:
        parent = family_parent
        children = [c for c in FAMILIES[family_parent]["children"] if c != stock]
        siblings = children
    else:
        parent = None
        children = []
        siblings = []

    sector_members = []
    if sector_name:
        sector_members = [s for s in SECTORS[sector_name] if s != stock]

    return {
        "stock": stock,
        "parent": parent,
        "children": children,
        "siblings": siblings,
        "sector": sector_name or "unknown",
        "sector_peers": sector_members,
        "all_related": get_related_companies(stock)
    }