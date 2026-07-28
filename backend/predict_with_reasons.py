import pandas as pd
import shap
import xgboost as xgb
import warnings
warnings.filterwarnings('ignore')

model = xgb.XGBClassifier()
model.load_model("crash_model.json")
THRESHOLD = float(model.get_booster().attr('prediction_threshold') or '0.5')

stocks = sorted(["RELIANCE", "TCS", "INFY", "HDFCBANK", "ADANIENT",
          "ICICIBANK", "SBIN", "HINDUNILVR", "ITC", "KOTAKBANK",
          "BAJFINANCE", "BHARTIARTL", "WIPRO", "MARUTI",
          "ASIANPAINT", "TITAN", "SUNPHARMA", "NTPC", "HCLTECH",
          "LT", "ONGC", "POWERGRID", "AXISBANK", "ULTRACEMCO"])

chg = "Daily_Change_%"

feature_cols = [
    "Prev_Change", "Prev_Volume", "Prev_Close",
    "Prev_Volatility_5d", "Prev_Volatility_10d",
    "Prev_Momentum_5d", "Prev_Momentum_10d", "Prev_Volume_Spike"
] + [f"Stock_{s}" for s in stocks]

explainer = shap.TreeExplainer(model)

def prepare_stock_data(csv_file, stock_name):
    df = pd.read_csv(csv_file, index_col=0)
    df = df.dropna(subset=["Close"])

    df["Volatility_5d"] = df[chg].rolling(5, min_periods=3).std()
    df["Volatility_10d"] = df[chg].rolling(10, min_periods=5).std()
    df["Momentum_5d"] = (df["Close"] / df["Close"].rolling(5, min_periods=3).mean() - 1) * 100
    df["Momentum_10d"] = (df["Close"] / df["Close"].rolling(10, min_periods=5).mean() - 1) * 100
    df["Volume_Spike"] = df["Volume"] / df["Volume"].rolling(10, min_periods=5).mean()

    for col in [chg, "Volume", "Close", "Volatility_5d", "Volatility_10d",
                "Momentum_5d", "Momentum_10d", "Volume_Spike"]:
        df[f"Prev_{col}"] = df[col].shift(1)

    df.rename(columns={f"Prev_{chg}": "Prev_Change"}, inplace=True)

    for s in stocks:
        df[f"Stock_{s}"] = 0
    df[f"Stock_{stock_name}"] = 1

    df.dropna(inplace=True)
    return df


def predict_and_explain(csv_file, stock_name):
    df = prepare_stock_data(csv_file, stock_name)
    X = df[feature_cols]

    latest_X = X.iloc[[-1]]
    probability = model.predict_proba(latest_X)[0][1]
    prediction = 1 if probability >= THRESHOLD else 0

    if prediction == 1:
        confidence_display = probability * 100
    else:
        confidence_display = (1 - probability) * 100

    shap_values = explainer.shap_values(latest_X)
    sv = shap_values[0]

    reasons = []
    risk_contributors = [(feature_cols[i], sv[i]) for i in range(len(feature_cols)) if sv[i] > 0]
    risk_contributors.sort(key=lambda x: x[1], reverse=True)

    if prediction == 1:
        for col, val in risk_contributors[:3]:
            if col.startswith("Stock_"):
                continue
            label = col.replace("Prev_", "").replace("_", " ")
            if "volatility" in label.lower():
                reasons.append(f"high {label.lower()}")
            elif "momentum" in label.lower():
                reasons.append(f"{label.lower()} shifting")
            elif "volume" in label.lower():
                reasons.append(f"volume spike ({val:.2f}x normal)")
            elif "change" in label.lower():
                reasons.append(f"unusual price movement ({latest_X.iloc[0]['Prev_Change']:.1f}%)")
            else:
                reasons.append(f"{label.lower()} elevated")
    else:
        reasons.append("no unusual signals detected")

    print(f"\n=== {stock_name} ===")
    print(f"Prediction: {'*** CRASH RISK ***' if prediction == 1 else 'SAFE'}")
    print(f"Confidence: {confidence_display:.1f}%  (threshold={THRESHOLD:.2f})")
    print(f"Reasons: {', '.join(reasons)}")

    return {
        "stock": stock_name,
        "prediction": int(prediction),
        "probability": float(probability),
        "reasons": reasons
    }


def test_on_crash_days(csv_file, stock_name, num_examples=5):
    df = prepare_stock_data(csv_file, stock_name)
    crash_days = df[df["Crash_Signal"] == 1]

    if len(crash_days) == 0:
        print(f"\n=== {stock_name}: No historical crash days found ===")
        return []

    sample = crash_days.tail(num_examples)
    results = []

    for idx, row in sample.iterrows():
        X_row = row[feature_cols].to_frame().T
        probability = model.predict_proba(X_row)[0][1]
        prediction = 1 if probability >= THRESHOLD else 0

        if prediction == 1:
            confidence_display = probability * 100
        else:
            confidence_display = (1 - probability) * 100

        shap_values = explainer.shap_values(X_row)
        sv = shap_values[0]

        reasons = []
        risk_contributors = [(feature_cols[i], sv[i]) for i in range(len(feature_cols)) if sv[i] > 0]
        risk_contributors.sort(key=lambda x: x[1], reverse=True)

        if prediction == 1:
            for col, val in risk_contributors[:2]:
                if col.startswith("Stock_"):
                    continue
                label = col.replace("Prev_", "").replace("_", " ")
                reasons.append(f"{label.lower()}")

        if not reasons:
            reasons.append("no unusual signals")

        print(f"\n=== {stock_name} — Crash Day {idx} ===")
        print(f"Model: {'*** CAUGHT ***' if prediction == 1 else 'MISSED'} ({confidence_display:.0f}% confidence)")
        print(f"Signals: {', '.join(reasons)}")

        results.append({
            "stock": stock_name,
            "date": str(idx),
            "prediction": int(prediction),
            "confidence": float(confidence_display),
            "reasons": reasons
        })

    return results


# === MAIN: Predict current risk for all stocks ===
print("="*70)
print(f"CRASH RADAR — 24 Stock Predictions  (threshold={THRESHOLD:.2f})")
print("="*70)

results = []
for name in stocks:
    result = predict_and_explain(f"{name}_data.csv", name)
    results.append(result)

# === MAIN: Test on historical crash days ===
print("\n\n" + "="*70)
print(f"HISTORICAL CRASH DETECTION TEST (threshold={THRESHOLD:.2f})")
print("="*70)

all_crash_results = []
for name in stocks:
    crash_results = test_on_crash_days(f"{name}_data.csv", name, num_examples=3)
    all_crash_results.extend(crash_results)

if all_crash_results:
    total = len(all_crash_results)
    caught = sum(1 for r in all_crash_results if r["prediction"] == 1)
    hit_rate = (caught / total * 100) if total > 0 else 0
    avg_confidence = sum(r["confidence"] for r in all_crash_results if r["prediction"] == 1)
    avg_confidence = avg_confidence / caught if caught > 0 else 0

    print(f"\n{'='*50}")
    print(f"HIT RATE: {caught}/{total} crashes detected ({hit_rate:.1f}%)")
    print(f"Avg confidence on catches: {avg_confidence:.1f}%")
    print(f"Threshold: {THRESHOLD:.2f}")
    print(f"{'='*50}")
    print("\nNOTE: This test uses the most recent crash days per stock, which may")
    print("overlap with training data. For a leakage-free evaluation, run")
    print("train_model.py which uses a strict chronological train/test split.")
