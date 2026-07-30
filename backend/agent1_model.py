import os
import json
import pickle
import threading
import time
import numpy as np
import pandas as pd
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import shap
import warnings
warnings.filterwarnings('ignore')

# Patch SHAP XGBTreeModelLoader for XGBoost 3.x base_score format compatibility ([5E-1] string format)
try:
    from shap.explainers._tree import XGBTreeModelLoader
    _orig_xgb_init = XGBTreeModelLoader.__init__
    def _safe_xgb_init(self, xgb_model):
        import shap.explainers._tree as tree_mod
        orig_decode = tree_mod.decode_ubjson_buffer
        def patched_decode(fd):
            res = orig_decode(fd)
            try:
                bs = res['learner']['learner_model_param']['base_score']
                if isinstance(bs, str) and bs.startswith('[') and bs.endswith(']'):
                    res['learner']['learner_model_param']['base_score'] = bs[1:-1]
            except Exception:
                pass
            return res
        tree_mod.decode_ubjson_buffer = patched_decode
        try:
            _orig_xgb_init(self, xgb_model)
        finally:
            tree_mod.decode_ubjson_buffer = orig_decode

    XGBTreeModelLoader.__init__ = _safe_xgb_init
except Exception:
    pass


from live_monitor import get_live_risk


def validate_timestamps(model_input, live_market):
    issues = []
    model_date = model_input.get("reference_date", "")
    live_ts = live_market.get("timestamp", "")
    if model_date and live_ts and model_date == live_ts[:10]:
        issues.append("Warning: model date matches live date — market may be closed")
    return {
        "is_consistent": len(issues) == 0,
        "issues": issues,
    }


def clean_for_json(obj):
    import numpy as np
    if isinstance(obj, dict):
        return {k: clean_for_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_for_json(i) for i in obj]
    elif isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.bool_):
        return bool(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    else:
        return obj


STOCKS = [
    "RELIANCE", "TCS", "INFY", "HDFCBANK", "ADANIENT",
    "WIPRO", "TITAN", "SBIN", "ICICIBANK", "KOTAKBANK",
    "AXISBANK", "BAJFINANCE", "HINDUNILVR", "MARUTI",
    "LT", "NTPC", "ONGC", "POWERGRID", "SUNPHARMA",
    "HCLTECH", "ITC", "ULTRACEMCO", "BHARTIARTL", "ASIANPAINT"
]

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))

# ============================================================
# CACHING SYSTEM
# ============================================================

_cache = {
    "model": None,
    "threshold": None,
    "feature_columns": None,
    "stock_data": {},
    "stock_features": {},
    "historical_patterns": {},
    "price_proximity": {},
    "shap_explainer": None,
    "last_updated": {},
}

_live_cache = {}
_live_cache_time = {}
_cache_lock = threading.Lock()


def load_model_once():
    if _cache["model"] is not None:
        return _cache["model"], _cache["threshold"], _cache["feature_columns"]

    model_path_json = os.path.join(BACKEND_DIR, 'crash_model.json')
    model_path_pkl = os.path.join(BACKEND_DIR, 'crash_model.pkl')
    threshold_path = os.path.join(BACKEND_DIR, 'threshold.txt')

    if os.path.exists(model_path_json):
        model = XGBClassifier()
        model.load_model(model_path_json)
        _cache["model"] = model
    elif os.path.exists(model_path_pkl):
        with open(model_path_pkl, 'rb') as f:
            _cache["model"] = pickle.load(f)

    with open(threshold_path, 'r') as f:
        _cache["threshold"] = float(f.read().strip())

    _cache["feature_columns"] = get_feature_columns()

    return _cache["model"], _cache["threshold"], _cache["feature_columns"]


def should_refresh_cache(stock):
    last_update = _cache["last_updated"].get(stock, 0)
    hours_since_update = (time.time() - last_update) / 3600
    return hours_since_update > 24


def find_historical_matches_fast(stock, latest_row, df):
    try:
        df = df.copy()

        today_change = float(latest_row.get("Prev_Change", 0))
        today_vol = float(latest_row.get("Prev_Volume_Spike", 1))
        today_momentum = float(latest_row.get("Prev_Momentum_5d", 0))
        today_volatility = float(latest_row.get("Prev_Volatility_5d", 0))

        df["vol_spike"] = df["Volume"] / df["Volume"].rolling(10).mean()
        df["momentum"] = df["Close"].pct_change(5)
        df["volatility"] = df["Close"].pct_change().rolling(5).std()
        df = df.dropna()

        df["sim_score"] = 0
        df.loc[abs(df["momentum"] - today_momentum) < 0.015, "sim_score"] += 30
        df.loc[abs(df["vol_spike"] - today_vol) < 0.3, "sim_score"] += 25
        df.loc[abs(df["Daily_Change_%"] - today_change) < 0.8, "sim_score"] += 25
        df.loc[abs(df["volatility"] - today_volatility) < 0.005, "sim_score"] += 20

        def _build_match(date, row, match_type):
            idx = df.index.get_loc(date)
            next_crash = False
            next_change = 0.0
            if idx + 1 < len(df):
                next_day = df.iloc[idx + 1]
                next_crash = float(next_day.get("Crash_Signal", 0)) == 1
                next_change = round(float(next_day.get("Daily_Change_%", 0)), 2)

            that_change = round(float(row["Daily_Change_%"]), 2)
            that_vol = round(float(row["vol_spike"]), 2)
            that_mom = round(float(row["momentum"]), 4)

            mom_diff = today_momentum - that_mom
            if abs(mom_diff) < 0.005:
                comparison = "Very similar to today — both show similar momentum"
            elif mom_diff < 0:
                comparison = f"Today momentum more negative than that day ({today_momentum:.4f} vs {that_mom:.4f})"
            else:
                comparison = f"Today momentum less negative than that day ({today_momentum:.4f} vs {that_mom:.4f})"

            if next_crash:
                what_happened_next = f"Dropped {abs(next_change):.1f}% next day"
            else:
                what_happened_next = f"Changed {next_change:+.1f}% next day — no crash"

            score = int(row["sim_score"])
            if score >= 80:
                sim_label = "HIGH"
            elif score >= 60:
                sim_label = "MEDIUM"
            else:
                sim_label = "LOW"

            return {
                "date": str(date)[:10],
                "type": match_type,
                "similarity": sim_label,
                "that_day": {
                    "price_change": f"{that_change:+.2f}%",
                    "volume_ratio": f"{that_vol}x normal",
                    "momentum": f"{that_mom}",
                },
                "today": {
                    "price_change": f"{today_change:+.2f}%",
                    "volume_ratio": f"{today_vol}x normal",
                    "momentum": f"{today_momentum}",
                },
                "comparison": comparison,
                "what_happened_next": what_happened_next,
                "crashed_next_day": next_crash,
            }

        # TYPE 1 — Historical (before 60 days ago)
        if len(df) > 60:
            historical_df = df.iloc[:-60]
        else:
            historical_df = df.iloc[:0]

        hist_similar = historical_df[historical_df["sim_score"] >= 50].copy()
        hist_similar = hist_similar.sort_values("sim_score", ascending=False).head(5)

        historical_matches = []
        for date, row in hist_similar.iterrows():
            historical_matches.append(_build_match(date, row, "historical"))

        # TYPE 2 — Recent (last 60 days)
        if len(df) > 60:
            recent_df = df.iloc[-60:]
        else:
            recent_df = df

        rec_similar = recent_df[recent_df["sim_score"] >= 50].copy()
        rec_similar = rec_similar.sort_values("sim_score", ascending=False).head(3)

        recent_matches = []
        for date, row in rec_similar.iterrows():
            recent_matches.append(_build_match(date, row, "recent"))

        # Combined crash rate
        all_matches = historical_matches + recent_matches
        crash_count = sum(1 for m in all_matches if m["crashed_next_day"])
        total_count = len(all_matches)
        crash_pct = round(crash_count / total_count * 100) if total_count > 0 else 0

        if total_count > 0:
            combined_crash_rate = f"{crash_count} out of {total_count} similar days led to crash ({crash_pct}%)"
        else:
            combined_crash_rate = "No similar historical patterns found"

        return {
            "historical_matches": historical_matches,
            "recent_matches": recent_matches,
            "combined_crash_rate": combined_crash_rate,
            "total_matches": total_count,
            "crash_count": crash_count,
            "crash_pct": crash_pct,
        }

    except Exception as e:
        return {
            "historical_matches": [],
            "recent_matches": [],
            "combined_crash_rate": "No data available",
            "total_matches": 0,
            "crash_count": 0,
            "crash_pct": 0,
        }


def check_price_proximity_fast(stock, df):
    try:
        crash_days = df[df["Crash_Signal"] == 1]
        if len(crash_days) == 0:
            return {"is_near_crash_zone": False}

        current_price = float(df["Close"].iloc[-1])
        recent_crashes = crash_days.tail(10)

        proximity_list = []
        for date, row in recent_crashes.iterrows():
            crash_price = float(row["Close"])
            distance = abs(current_price - crash_price) / crash_price * 100
            proximity_list.append({
                "crash_date": str(date),
                "crash_price": round(crash_price, 2),
                "distance_pct": round(distance, 2),
                "in_danger_zone": distance < 3.0,
            })

        proximity_list.sort(key=lambda x: x["distance_pct"])
        nearest = proximity_list[0] if proximity_list else {}

        return {
            "current_price": round(current_price, 2),
            "nearest_crash_price": nearest.get("crash_price"),
            "distance_pct": nearest.get("distance_pct"),
            "is_near_crash_zone": nearest.get("in_danger_zone", False),
            "nearby_crash_levels": proximity_list[:3],
            "note": "Price proximity is a supporting signal only, not direct crash evidence",
        }
    except Exception as e:
        return {"is_near_crash_zone": False, "error": str(e)}


def precompute_stock(stock: str):
    try:
        csv_path = os.path.join(BACKEND_DIR, f"{stock}_data.csv")
        df = pd.read_csv(csv_path, skiprows=[1], index_col=0)
        df = df.dropna(subset=['Close'])
        _cache["stock_data"][stock] = df

        features_df = prepare_features(df, stock)
        _cache["stock_features"][stock] = features_df

        if len(features_df) > 0:
            latest = features_df.iloc[-1]
            matches = find_historical_matches_fast(stock, latest, df)
            _cache["historical_patterns"][stock] = matches

        proximity = check_price_proximity_fast(stock, df)
        _cache["price_proximity"][stock] = proximity

        _cache["last_updated"][stock] = time.time()
        print(f"Precomputed {stock}")

    except Exception as e:
        print(f"Failed to precompute {stock}: {e}")


def precompute_all_stocks():
    stocks = [
        "RELIANCE", "TCS", "INFY", "HDFCBANK", "ADANIENT",
        "WIPRO", "TITAN", "SBIN", "ICICIBANK", "KOTAKBANK",
        "AXISBANK", "BAJFINANCE", "HINDUNILVR", "MARUTI",
        "LT", "NTPC", "ONGC", "POWERGRID", "SUNPHARMA",
        "HCLTECH", "ITC", "ULTRACEMCO", "BHARTIARTL", "ASIANPAINT",
    ]
    for stock in stocks:
        precompute_stock(stock)
    print("All stocks precomputed and cached!")


# ============================================================
# PART 1 — FEATURE ENGINEERING
# ============================================================

def prepare_features(df, stock_name):
    df = df.copy()
    df = df.dropna(subset=["Close"])

    if "Daily_Change_%" in df.columns:
        df["Daily_Change_%"] = df["Daily_Change_%"]

    df["Prev_Change"] = df["Daily_Change_%"].shift(1)
    df["Prev_Volume"] = df["Volume"].shift(1)
    df["Prev_Close"] = df["Close"].shift(1)
    df["Prev_Volatility_5d"] = df["Close"].pct_change().rolling(5).std().shift(1)
    df["Prev_Volatility_10d"] = df["Close"].pct_change().rolling(10).std().shift(1)
    df["Prev_Momentum_5d"] = df["Close"].pct_change(5).shift(1)
    df["Prev_Momentum_10d"] = df["Close"].pct_change(10).shift(1)
    df["Prev_Volume_Spike"] = (df["Volume"] / df["Volume"].rolling(10).mean()).shift(1)

    all_stocks = [
        "ADANIENT", "ASIANPAINT", "AXISBANK",
        "BAJFINANCE", "BHARTIARTL", "HCLTECH", "HDFCBANK",
        "HINDUNILVR", "ICICIBANK", "INFY", "ITC", "KOTAKBANK",
        "LT", "MARUTI", "NTPC", "ONGC", "POWERGRID", "RELIANCE",
        "SBIN", "SUNPHARMA", "TCS", "TITAN", "ULTRACEMCO", "WIPRO",
    ]

    for s in all_stocks:
        df[f"Stock_{s}"] = 0

    col_name = f"Stock_{stock_name.upper()}"
    if col_name in df.columns:
        df[col_name] = 1

    df.dropna(inplace=True)

    FEATURE_COLS = [
        "Prev_Change", "Prev_Volume", "Prev_Close",
        "Prev_Volatility_5d", "Prev_Volatility_10d",
        "Prev_Momentum_5d", "Prev_Momentum_10d",
        "Prev_Volume_Spike",
        "Stock_ADANIENT", "Stock_ASIANPAINT",
        "Stock_AXISBANK", "Stock_BAJFINANCE",
        "Stock_BHARTIARTL", "Stock_HCLTECH",
        "Stock_HDFCBANK", "Stock_HINDUNILVR",
        "Stock_ICICIBANK", "Stock_INFY", "Stock_ITC",
        "Stock_KOTAKBANK", "Stock_LT", "Stock_MARUTI",
        "Stock_NTPC", "Stock_ONGC", "Stock_POWERGRID",
        "Stock_RELIANCE", "Stock_SBIN", "Stock_SUNPHARMA",
        "Stock_TCS", "Stock_TITAN", "Stock_ULTRACEMCO",
        "Stock_WIPRO",
    ]

    return df[FEATURE_COLS]


# ============================================================
# PART 2 — MODEL TRAINING
# ============================================================

def train_and_save_model():
    """Load all 24 stock CSVs, engineer features, train XGB, save artifacts."""
    all_data = []
    for stock in STOCKS:
        csv_path = os.path.join(BACKEND_DIR, f"{stock}_data.csv")
        if not os.path.exists(csv_path):
            print(f"  Skipping {stock} — {csv_path} not found")
            continue
        try:
            df = pd.read_csv(csv_path, skiprows=[1], index_col=0)
            df = prepare_features(df, stock)
            all_data.append(df)
            print(f"  Loaded {stock}: {len(df)} rows")
        except Exception as e:
            print(f"  Error loading {stock}: {e}")

    data = pd.concat(all_data, ignore_index=False)
    data = data.dropna(subset=['Close'])
    data = data.sort_index()

    stock_dummies = pd.get_dummies(data['Stock'], prefix='Stock')
    data = pd.concat([data, stock_dummies], axis=1)

    base_features = [
        'Prev_Change', 'Prev_Volume', 'Prev_Close',
        'Prev_Volatility_5d', 'Prev_Volatility_10d',
        'Prev_Momentum_5d', 'Prev_Momentum_10d', 'Prev_Volume_Spike'
    ]
    stock_cols = [c for c in stock_dummies.columns]
    all_features = base_features + stock_cols

    for col in all_features:
        if col not in data.columns:
            data[col] = 0

    data = data.dropna(subset=all_features + ['Crash_Signal'])

    print(f"\nTotal rows: {len(data)} across {data['Stock'].nunique()} stocks")
    print(f"Date range: {data.index.min()} to {data.index.max()}")
    print(f"Crash rate: {data['Crash_Signal'].mean()*100:.2f}%")
    print(f"Features: {len(all_features)}")

    data = data.sort_index()
    unique_dates = data.index.unique().sort_values()
    date_cutoff_idx = int(len(unique_dates) * 0.8)
    cutoff_date = unique_dates[date_cutoff_idx]

    train_mask = data.index <= cutoff_date
    test_mask = data.index > cutoff_date

    X = data[all_features]
    y = data['Crash_Signal']

    X_train, X_test = X[train_mask], X[test_mask]
    y_train, y_test = y[train_mask], y[test_mask]

    print(f"\nTrain: {len(X_train)} rows (ends {data[train_mask].index.max()})")
    print(f"Test:  {len(X_test)} rows (starts {data[test_mask].index.min()})")

    model = XGBClassifier(
        n_estimators=200, max_depth=6, learning_rate=0.1,
        scale_pos_weight=(1 - y_train.mean()) / y_train.mean(),
        random_state=42, eval_metric='logloss'
    )
    model.fit(X_train, y_train)

    y_prob = model.predict_proba(X_test)[:, 1]

    best_threshold = 0.5
    best_f1 = 0.0
    for t in np.arange(0.1, 0.91, 0.05):
        preds = (y_prob >= t).astype(int)
        f1 = f1_score(y_test, preds, pos_label=1)
        if f1 > best_f1:
            best_f1 = f1
            best_threshold = round(float(t), 2)

    y_test_final = (y_prob >= best_threshold).astype(int)
    acc = accuracy_score(y_test, y_test_final)
    prec = precision_score(y_test, y_test_final, pos_label=1)
    rec = recall_score(y_test, y_test_final, pos_label=1)
    f1 = f1_score(y_test, y_test_final, pos_label=1)

    print(f"\n--- Training Summary ---")
    print(f"Date range trained on: {data.index.min()} to {data[train_mask].index.max()}")
    print(f"Total rows: {len(data)}")
    print(f"Crash events: {int(data['Crash_Signal'].sum())}")
    print(f"Accuracy:  {acc*100:.2f}%")
    print(f"Precision: {prec*100:.2f}%")
    print(f"Recall:    {rec*100:.2f}%")
    print(f"F1:        {f1*100:.2f}%")
    print(f"Best threshold: {best_threshold}")

    model_path = os.path.join(BACKEND_DIR, 'crash_model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    print(f"\nModel saved to {model_path}")

    threshold_path = os.path.join(BACKEND_DIR, 'threshold.txt')
    with open(threshold_path, 'w') as f:
        f.write(str(best_threshold))
    print(f"Threshold saved to {threshold_path}")

    feature_path = os.path.join(BACKEND_DIR, 'feature_columns.txt')
    with open(feature_path, 'w') as f:
        for col in all_features:
            f.write(col + '\n')
    print(f"Feature columns saved to {feature_path}")

    print("\nTraining complete.")


def get_feature_columns():
    """Return the exact feature column list from feature_columns.txt."""
    feature_path = os.path.join(BACKEND_DIR, 'feature_columns.txt')
    with open(feature_path, 'r') as f:
        return [line.strip() for line in f if line.strip()]


# ============================================================
# PART 3 — HISTORICAL ANALOGY (ORIGINAL detailed version)
# ============================================================

def find_historical_matches(stock, current_features, live_data=None):
    """Find top 5 most similar historical days and check if crash followed."""
    csv_path = os.path.join(BACKEND_DIR, f"{stock}_data.csv")
    df = pd.read_csv(csv_path, skiprows=[1], index_col=0)
    df = prepare_features(df, stock)
    df = df.dropna(subset=['Prev_Volume_Spike', 'Prev_Change', 'Prev_Volatility_5d'])

    cur_vol_spike = current_features.get('Prev_Volume_Spike', 0)
    cur_change = current_features.get('Prev_Change', 0)
    cur_vol = current_features.get('Prev_Volatility_5d', 0)
    cur_momentum = current_features.get('Prev_Momentum_5d', 0)

    live_volume_ratio = 1.0
    live_price_change = 0.0
    if live_data:
        live_volume_ratio = live_data.get("volume_ratio", 1.0)
        live_price_change = live_data.get("price_change_pct", 0)

    df['sim_volume'] = (df['Prev_Volume_Spike'] - cur_vol_spike).abs()
    df['sim_change'] = (df['Prev_Change'] - cur_change).abs()
    df['sim_volatility'] = (df['Prev_Volatility_5d'] - cur_vol).abs()

    candidates = df[
        (df['sim_volume'] <= 0.5) &
        (df['sim_change'] <= 1.0) &
        (df['sim_volatility'] <= 0.01)
    ].copy()

    if len(candidates) == 0:
        relaxed = df.copy()
        relaxed['distance'] = (
            relaxed['sim_volume'] / 0.5 +
            relaxed['sim_change'] / 1.0 +
            relaxed['sim_volatility'] / 0.01
        )
        candidates = relaxed.nsmallest(5, 'distance')
    else:
        candidates['distance'] = (
            candidates['sim_volume'] / 0.5 +
            candidates['sim_change'] / 1.0 +
            candidates['sim_volatility'] / 0.01
        )
        candidates = candidates.nsmallest(5, 'distance')

    matches = []
    crash_count = 0
    for idx, row in candidates.iterrows():
        date_str = str(idx)
        pos = df.index.get_loc(idx)
        crashed_next = False
        next_day_change = 0.0
        if pos + 1 < len(df):
            next_row = df.iloc[pos + 1]
            crashed_next = next_row.get('Crash_Signal', 0) == 1
            next_day_change = round(float(next_row.get('Daily_Change_%', 0)), 2)

        if crashed_next:
            crash_count += 1

        that_day_volume_ratio = round(float(row.get('Prev_Volume_Spike', 0)), 2)
        that_day_change = round(float(row.get('Prev_Change', 0)), 2)
        that_day_momentum = round(float(row.get('Prev_Momentum_5d', 0)), 4)

        if live_volume_ratio > that_day_volume_ratio:
            volume_verdict = "Today volume HIGHER than that crash day"
        elif live_volume_ratio < that_day_volume_ratio:
            volume_verdict = "Today volume LOWER than that crash day"
        else:
            volume_verdict = "Today volume SAME as that crash day"

        if live_price_change < that_day_change:
            price_verdict = "Today price MORE DANGEROUS than that day"
        elif live_price_change > that_day_change:
            price_verdict = "Today price SAFER than that day"
        else:
            price_verdict = "Today price SAME as that day"

        momentum_diff = abs(cur_momentum - that_day_momentum)
        if momentum_diff < 0.01:
            momentum_verdict = "Today momentum SIMILAR to that day"
        else:
            momentum_verdict = "Today momentum DIFFERENT from that day"

        max_distance = 0.5 + 1.0 + 0.01
        raw_distance = (
            abs(that_day_volume_ratio - cur_vol_spike) / 0.5 +
            abs(that_day_change - cur_change) / 1.0 +
            abs(that_day_momentum - cur_momentum) / 0.01
        )
        similarity_score = round(max(0, 1 - (raw_distance / max_distance)), 3)

        if crashed_next and similarity_score > 0.6:
            danger_level = "HIGH"
        elif crashed_next and similarity_score > 0.3:
            danger_level = "MEDIUM"
        else:
            danger_level = "LOW"

        if crashed_next:
            what_happened_next_day = f"Stock dropped {abs(next_day_change)}% (CRASH)"
        else:
            what_happened_next_day = "Stock stayed safe"

        matches.append({
            'match_date': date_str,
            'comparison': {
                'today_volume_ratio': live_volume_ratio,
                'that_day_volume_ratio': that_day_volume_ratio,
                'volume_verdict': volume_verdict,
                'today_price_change': live_price_change,
                'that_day_price_change': that_day_change,
                'price_verdict': price_verdict,
                'today_momentum': round(cur_momentum, 4),
                'that_day_momentum': that_day_momentum,
                'momentum_verdict': momentum_verdict,
            },
            'what_happened_next_day': what_happened_next_day,
            'next_day_change': next_day_change,
            'similarity_score': similarity_score,
            'danger_level': danger_level,
            'price_that_day': round(float(row.get('Close', 0)), 2),
        })

    total = len(matches)
    crash_rate_str = f"{crash_count} out of {total} similar days led to crash"
    most_recent = matches[0]['match_date'] if matches else 'N/A'
    hist_crash_pct = round((crash_count / total * 100), 1) if total > 0 else 0.0

    comparison_explanation = ""
    if matches:
        top = matches[0]
        top_date = top['match_date']
        top_volume = top['comparison']['that_day_volume_ratio']
        top_result = top['what_happened_next_day']

        if live_volume_ratio > top_volume:
            volume_comparison = f"Today volume ({live_volume_ratio}x) is HIGHER than that reference date ({top_volume}x) suggesting MORE risk"
        elif live_volume_ratio < top_volume:
            volume_comparison = f"Today volume ({live_volume_ratio}x) is LOWER than that reference date ({top_volume}x) suggesting LESS risk"
        else:
            volume_comparison = f"Today volume ({live_volume_ratio}x) is SAME as that reference date ({top_volume}x) suggesting SIMILAR risk"

        comparison_explanation = (
            f"Today's signals are compared against {total} real historical dates from Jan 2020 to Jul 2026. "
            f"Most similar date: {top_date} where volume was {top_volume}x normal and stock {'crashed' if 'crashed' in top_result.lower() else 'stayed safe'} next day. "
            f"{volume_comparison}."
        )

    return {
        'matches': matches,
        'crash_rate': crash_rate_str,
        'most_recent_match': most_recent,
        'historical_crash_rate_pct': hist_crash_pct,
        'comparison_explanation': comparison_explanation,
    }


# ============================================================
# PART 4 — PRICE PROXIMITY (ORIGINAL detailed version)
# ============================================================

def check_price_proximity(stock, current_price):
    """Find 3 most recent crash days and measure price distance."""
    csv_path = os.path.join(BACKEND_DIR, f"{stock}_data.csv")
    df = pd.read_csv(csv_path, skiprows=[1], index_col=0)
    df.index = pd.to_datetime(df.index)

    crash_days = df[df['Crash_Signal'] == 1].copy()
    crash_days = crash_days.sort_index(ascending=False)
    recent_crashes = crash_days.head(3)

    nearby = []
    nearest_price = None
    min_distance = float('inf')
    is_near = False

    for idx, row in recent_crashes.iterrows():
        crash_price = float(row['Close'])
        distance = abs(current_price - crash_price) / crash_price * 100
        danger = distance <= 3.0
        if danger:
            is_near = True
        if distance < min_distance:
            min_distance = distance
            nearest_price = crash_price

        nearby.append({
            'crash_date': str(idx.date()),
            'crash_price': round(crash_price, 2),
            'distance_pct': round(distance, 2),
            'danger_zone': danger,
        })

    return {
        'nearby_crash_levels': nearby,
        'nearest_crash_price': round(nearest_price, 2) if nearest_price else None,
        'is_near_crash_zone': is_near,
    }


# ============================================================
# PART 5 — MAIN PREDICT FUNCTION (with caching)
# ============================================================

def get_agent1_result(stock, current_price=None, current_volume=None):
    """Full prediction pipeline: model + SHAP + historical analogy + price proximity + live monitor."""
    stock = stock.upper()

    model, threshold, feature_cols = load_model_once()

    if should_refresh_cache(stock):
        precompute_stock(stock)

    if stock in _cache["stock_features"]:
        features_df = _cache["stock_features"][stock]
        df = _cache["stock_data"][stock]
        historical_matches = _cache["historical_patterns"].get(stock, [])
        price_proximity = _cache["price_proximity"].get(stock, {})
    else:
        precompute_stock(stock)
        features_df = _cache["stock_features"].get(stock, pd.DataFrame())
        df = _cache["stock_data"].get(stock, pd.DataFrame())
        historical_matches = _cache["historical_patterns"].get(stock, [])
        price_proximity = _cache["price_proximity"].get(stock, {})

    if isinstance(features_df, pd.DataFrame) and features_df.empty:
        return clean_for_json({
            'risk_score': 0,
            'is_danger': False,
            'threshold_used': threshold,
            'historical_context': {},
            'price_proximity': {},
            'live_vs_history': {},
            'live_monitor': {},
            'shap_reasons': [],
            'plain_english': f"No data available for {stock}.",
        })

    latest_features = features_df.iloc[[-1]]

    if current_price is not None:
        latest_features = latest_features.copy()
        latest_features["Prev_Close"] = current_price
    if current_volume is not None:
        latest_features = latest_features.copy()
        latest_features["Prev_Volume"] = current_volume

    missing_cols = [c for c in feature_cols if c not in latest_features.columns]
    for col in missing_cols:
        latest_features[col] = 0

    extra_cols = [c for c in latest_features.columns if c not in feature_cols]
    if extra_cols:
        latest_features = latest_features.drop(columns=extra_cols)

    latest_features = latest_features[feature_cols]

    proba = float(model.predict_proba(latest_features)[0][1])
    risk_score = proba * 100
    is_danger = proba >= threshold

    if _cache["shap_explainer"] is None:
        _cache["shap_explainer"] = shap.TreeExplainer(model)

    shap_vals = _cache["shap_explainer"].shap_values(latest_features)
    if isinstance(shap_vals, list):
        shap_vals = shap_vals[1]

    shap_series = pd.Series(shap_vals[0], index=feature_cols)
    top_shap = shap_series.abs().nlargest(3)

    feature_name_map = {
        'Prev_Change': 'previous day price change',
        'Prev_Volume': 'previous day trading volume',
        'Prev_Close': 'previous closing price',
        'Prev_Volatility_5d': '5-day volatility',
        'Prev_Volatility_10d': '10-day volatility',
        'Prev_Momentum_5d': '5-day momentum',
        'Prev_Momentum_10d': '10-day momentum',
        'Prev_Volume_Spike': 'volume spike vs 10-day average',
    }

    shap_reasons = []
    for feat, val in top_shap.items():
        fname = feature_name_map.get(feat, feat)
        direction = "increases" if shap_vals[0][feature_cols.index(feat)] > 0 else "reduces"
        shap_reasons.append(
            f"{fname} {direction} crash risk (impact: {abs(val):.4f})"
        )

    cache_age = time.time() - _live_cache_time.get(stock, 0)
    if cache_age < 300 and stock in _live_cache:
        live_data = _live_cache[stock]
    else:
        live_data = get_live_risk(stock)
        _live_cache[stock] = live_data
        _live_cache_time[stock] = time.time()

    live_volume_ratio = float(live_data.get("volume_ratio", 1.0))
    live_price_change = float(live_data.get("price_change_pct", 0))
    live_declining = bool(live_data.get("accelerating_decline", False))
    live_time = live_data.get("as_of", "unknown")

    danger_count = sum([
        live_volume_ratio > 1.2,
        live_price_change < -1.5,
        live_declining,
    ])

    if danger_count >= 2:
        live_verdict = "Live signals CONFIRM danger — act immediately!"
    elif danger_count == 1:
        live_verdict = "Live signals show early warning — monitor closely"
    else:
        live_verdict = "Live signals confirm LOW risk right now"

    if danger_count >= 2:
        risk_score = min(100, risk_score + 15)
    elif danger_count == 0:
        risk_score = max(0, risk_score - 10)

    avg_volume = df['Volume'].mean()
    current_vol_val = float(latest_features.iloc[0].get('Prev_Volume', 0)) if current_volume is None else current_volume
    last_session_vol_ratio = round(current_vol_val / avg_volume, 2) if avg_volume > 0 else 0

    last_session_change = float(latest_features.iloc[0].get('Prev_Change', 0))
    last_session_momentum = float(latest_features.iloc[0].get('Prev_Momentum_5d', 0))

    current_price_val = float(latest_features.iloc[0].get('Prev_Close', 0)) if current_price is None else current_price
    nearest_crash = price_proximity.get('nearest_crash_price')
    distance_pct = price_proximity.get('distance_pct', 0)

    total_matches = historical_matches.get('total_matches', 0)
    hist_crash_count = historical_matches.get('crash_count', 0)
    crash_pct = historical_matches.get('crash_pct', 0)
    combined_rate = historical_matches.get('combined_crash_rate', 'No data')

    all_hist_matches = historical_matches.get('historical_matches', []) + historical_matches.get('recent_matches', [])
    best_match = all_hist_matches[0] if all_hist_matches else {}
    best_match_date = best_match.get('date', 'N/A')
    best_match_what = best_match.get('what_happened_next', 'N/A')

    import datetime
    ref_date_str = str(features_df.index[-1])[:10]
    today_str = datetime.date.today().isoformat()
    data_consistency = "ok" if ref_date_str != today_str else f"warning: reference_date {ref_date_str} is today — model input should be a past session"

    historical_ctx = {
        'years_of_data': '6.5 years (Jan 2020 - Jul 2026)',
        'total_crash_events_in_training': 3104,
        'similar_patterns_found': total_matches,
        'crash_rate': combined_rate,
        'historical_crash_rate_pct': crash_pct,
        'most_recent_similar_date': best_match_date,
        'what_happened_then': best_match_what,
        'historical_matches': historical_matches.get('historical_matches', []),
        'recent_matches': historical_matches.get('recent_matches', []),
    }

    recent = df.tail(5)
    consecutive_declines = 0
    for i in range(1, len(recent)):
        if recent['Daily_Change_%'].iloc[i] < 0:
            consecutive_declines += 1

    total_5day_change = (
        (recent['Close'].iloc[-1] - recent['Close'].iloc[0])
        / recent['Close'].iloc[0] * 100
    )

    plain_english = (
        f"{stock}: last session ({ref_date_str}) change was "
        f"{last_session_change:+.2f}% "
        f"with volume {last_session_vol_ratio:.2f}x normal. "
        f"5-day momentum: {total_5day_change:+.1f}% "
        f"({consecutive_declines} declining sessions). "
        f"Live intraday: price {live_price_change:+.2f}%, "
        f"volume {live_volume_ratio:.2f}x normal. "
        f"Based on {total_matches} similar historical patterns, "
        f"{hist_crash_count} led to crashes ({crash_pct}%). "
        f"Model risk: {risk_score:.1f}%."
    )

    return clean_for_json({
        'risk_score': round(float(risk_score), 2),
        'is_danger': bool(is_danger),
        'threshold_used': threshold,

        'model_input': {
            'reference_date': ref_date_str,
            'last_session_change': f"{last_session_change:+.2f}%",
            'last_session_volume_ratio': f"{last_session_vol_ratio:.2f}x",
            'momentum_5d': f"{last_session_momentum * 100:+.2f}%",
        },

        'live_market': {
            'timestamp': live_time,
            'current_intraday_change': f"{live_price_change:+.2f}%",
            'current_volume_ratio': f"{live_volume_ratio:.2f}x normal",
            'live_verdict': live_data.get('alert_level', live_verdict),
        },

        'historical_context': historical_ctx,

        'shap_reasons': shap_reasons,

        'plain_english': plain_english,

        'data_consistency': data_consistency,
    })


# ============================================================
# PART 6 — RETRAIN COMMAND
# ============================================================

if __name__ == '__main__':
    train_and_save_model()
