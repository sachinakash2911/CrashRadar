import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.metrics import precision_recall_curve, average_precision_score
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import warnings
warnings.filterwarnings('ignore')

stocks = sorted(["RELIANCE", "TCS", "INFY", "HDFCBANK", "ADANIENT",
          "ICICIBANK", "SBIN", "HINDUNILVR", "ITC", "KOTAKBANK",
          "BAJFINANCE", "BHARTIARTL", "WIPRO", "MARUTI",
          "ASIANPAINT", "TITAN", "SUNPHARMA", "NTPC", "HCLTECH",
          "LT", "ONGC", "POWERGRID", "AXISBANK", "ULTRACEMCO"])

chg = "Daily_Change_%"

model = xgb.XGBClassifier()
model.load_model("crash_model.json")
threshold = float(model.get_booster().attr('prediction_threshold') or '0.5')
print(f"Loaded model, prediction threshold = {threshold:.2f}")

feature_cols = [
    "Prev_Change", "Prev_Volume", "Prev_Close",
    "Prev_Volatility_5d", "Prev_Volatility_10d",
    "Prev_Momentum_5d", "Prev_Momentum_10d", "Prev_Volume_Spike"
] + [f"Stock_{s}" for s in stocks]

all_data = []
for stock in stocks:
    try:
        df = pd.read_csv(f"{stock}_data.csv", index_col=0)
        if chg not in df.columns:
            df = pd.read_csv(f"{stock}_data.csv", skiprows=[1], index_col=0)
        df["Stock"] = stock
        all_data.append(df)
    except FileNotFoundError:
        pass

data = pd.concat(all_data)
data = data.dropna(subset=["Close"])
data = data.sort_index()

data["Volatility_5d"] = data.groupby("Stock")[chg].transform(lambda x: x.rolling(5, min_periods=3).std())
data["Volatility_10d"] = data.groupby("Stock")[chg].transform(lambda x: x.rolling(10, min_periods=5).std())
data["Momentum_5d"] = data.groupby("Stock")["Close"].transform(
    lambda x: (x / x.rolling(5, min_periods=3).mean() - 1) * 100)
data["Momentum_10d"] = data.groupby("Stock")["Close"].transform(
    lambda x: (x / x.rolling(10, min_periods=5).mean() - 1) * 100)
data["Volume_Spike"] = data.groupby("Stock")["Volume"].transform(
    lambda x: x / x.rolling(10, min_periods=5).mean())

for col in [chg, "Volume", "Close", "Volatility_5d", "Volatility_10d",
            "Momentum_5d", "Momentum_10d", "Volume_Spike"]:
    data[f"Prev_{col}"] = data.groupby("Stock")[col].transform(lambda x: x.shift(1))

data.rename(columns={f"Prev_{chg}": "Prev_Change"}, inplace=True)

for s in stocks:
    data[f"Stock_{s}"] = 0
for stock_name in stocks:
    data.loc[data["Stock"] == stock_name, f"Stock_{stock_name}"] = 1

data = data.dropna(subset=feature_cols + ["Crash_Signal"])

# Chronological split (same logic as train_model.py)
unique_dates = data.index.unique().sort_values()
cutoff_date = unique_dates[int(len(unique_dates) * 0.8)]
test_mask = data.index > cutoff_date

X_test = data.loc[test_mask, feature_cols]
y_test = data.loc[test_mask, "Crash_Signal"]

print(f"Test set: {len(X_test)} rows, crash rate = {y_test.mean()*100:.2f}%")

y_prob = model.predict_proba(X_test)[:, 1]
precision, recall, thresholds_pr = precision_recall_curve(y_test, y_prob)
avg_prec = average_precision_score(y_test, y_prob)

print(f"\nAverage Precision (AP) = {avg_prec:.4f}")
print(f"Saving precision_recall_curve.png at 150 DPI...")

fig, ax = plt.subplots(figsize=(8, 6))
ax.plot(recall, precision, linewidth=2, color='#2c7bb6', label=f'XGBoost (AP = {avg_prec:.3f})')

# Mark the chosen threshold
y_pred_at_threshold = (y_prob >= threshold).astype(int)
from sklearn.metrics import recall_score, precision_score
rec_at_t = recall_score(y_test, y_pred_at_threshold, pos_label=1)
prec_at_t = precision_score(y_test, y_pred_at_threshold, pos_label=1)
ax.scatter([rec_at_t], [prec_at_t], color='#d7191c', s=100, zorder=5,
           label=f'Threshold={threshold:.2f} (R={rec_at_t:.2f}, P={prec_at_t:.2f})')

ax.set_xlabel('Recall', fontsize=12)
ax.set_ylabel('Precision', fontsize=12)
ax.set_title('Precision-Recall Curve — Crash Class', fontsize=14)
ax.legend(loc='lower left', fontsize=10)
ax.grid(True, alpha=0.3)
ax.set_xlim([0, 1])
ax.set_ylim([0, 1])

fig.tight_layout()
fig.savefig('precision_recall_curve.png', dpi=150)
print("Done — saved precision_recall_curve.png")
