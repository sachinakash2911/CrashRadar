import pandas as pd
import xgboost as xgb
import shap
import warnings
warnings.filterwarnings('ignore')

model = xgb.XGBClassifier()
model.load_model("crash_model.json")

stocks = sorted(["RELIANCE", "TCS", "INFY", "HDFCBANK", "ADANIENT",
          "ICICIBANK", "SBIN", "HINDUNILVR", "ITC", "KOTAKBANK",
          "BAJFINANCE", "BHARTIARTL", "WIPRO", "MARUTI",
          "ASIANPAINT", "TITAN", "SUNPHARMA", "NTPC", "HCLTECH",
          "LT", "ONGC", "POWERGRID", "AXISBANK", "ULTRACEMCO"])

chg = "Daily_Change_%"

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

df = prepare_stock_data("RELIANCE_data.csv", "RELIANCE")

feature_cols = [
    "Prev_Change", "Prev_Volume", "Prev_Close",
    "Prev_Volatility_5d", "Prev_Volatility_10d",
    "Prev_Momentum_5d", "Prev_Momentum_10d", "Prev_Volume_Spike"
] + [f"Stock_{s}" for s in stocks]

X = df[feature_cols]
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X)

latest = X.iloc[-1]
sv = shap_values[-1]

print("=== Latest Day Risk Explanation ===")
print(f"Prev Change:          {latest['Prev_Change']:.2f}%")
print(f"Prev Volume:          {latest['Prev_Volume']:.0f}")
print(f"Prev Close:           {latest['Prev_Close']:.2f}")
print(f"Prev Volatility_5d:   {latest['Prev_Volatility_5d']:.2f}")
print(f"Prev Volatility_10d:  {latest['Prev_Volatility_10d']:.2f}")
print(f"Prev Momentum_5d:     {latest['Prev_Momentum_5d']:.2f}%")
print(f"Prev Momentum_10d:    {latest['Prev_Momentum_10d']:.2f}%")
print(f"Prev Volume_Spike:    {latest['Prev_Volume_Spike']:.2f}")

print("\n=== SHAP Values (feature contributions to crash risk) ===")
impacts = []
for i, col in enumerate(feature_cols):
    impacts.append((col, sv[i]))

impacts.sort(key=lambda x: abs(x[1]), reverse=True)
for col, val in impacts:
    arrow = "risky" if val > 0 else "safe"
    print(f"  {col:30s} {val:+.4f}  ({arrow})")

print("\n=== Plain English ===")
signal = []
if sv[feature_cols.index("Prev_Change")] > 0:
    signal.append("yesterday's big drop")
if sv[feature_cols.index("Prev_Volume_Spike")] > 0:
    signal.append("volume spike")
if sv[feature_cols.index("Prev_Volatility_10d")] > 0:
    signal.append("elevated 10-day volatility")
if sv[feature_cols.index("Prev_Momentum_5d")] > 0:
    signal.append("short-term momentum shift")

if signal:
    print(f"Risk contributors: {', '.join(signal)}")
else:
    print("No strong risk signals")
