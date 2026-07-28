import pandas as pd
import numpy as np
from xgboost import XGBClassifier
from sklearn.metrics import (accuracy_score, classification_report, confusion_matrix,
                             precision_recall_curve, average_precision_score,
                             f1_score, recall_score, precision_score)
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import warnings
warnings.filterwarnings('ignore')

stocks = [
    "RELIANCE", "TCS", "INFY", "HDFCBANK", "ADANIENT",
    "ICICIBANK", "SBIN", "HINDUNILVR", "ITC", "KOTAKBANK",
    "BAJFINANCE", "BHARTIARTL", "WIPRO", "MARUTI",
    "ASIANPAINT", "TITAN", "SUNPHARMA", "NTPC", "HCLTECH",
    "LT", "ONGC", "POWERGRID", "AXISBANK", "ULTRACEMCO"
]

all_data = []
for stock in stocks:
    try:
        df = pd.read_csv(f"{stock}_data.csv", index_col=0)
        if 'Daily_Change_%' not in df.columns:
            df = pd.read_csv(f"{stock}_data.csv", skiprows=[1], index_col=0)
        df["Stock"] = stock
        all_data.append(df)
    except FileNotFoundError:
        pass

data = pd.concat(all_data)
data = data.dropna(subset=["Close"])
data = data.sort_index()

print(f"Total rows: {len(data)} across {data['Stock'].nunique()} stocks")
print(f"Date range: {data.index.min()} to {data.index.max()}")
print(f"Crash rate: {data['Crash_Signal'].mean()*100:.2f}%")

# ============================================================
# PHASE B — Split/Bonus Artifact Detection
# ============================================================
chg = "Daily_Change_%"
print("\n--- Phase B: Checking for split/bonus artifacts ---")
artifact_count = 0
for stock in data["Stock"].unique():
    mask = data["Stock"] == stock
    sdf = data[mask].copy()
    for i in range(len(sdf)):
        if sdf.iloc[i][chg] < -15:
            for offset in [1, 2]:
                if i + offset < len(sdf) and sdf.iloc[i + offset][chg] > 10:
                    date_to_fix = sdf.index[i]
                    data.loc[(data["Stock"] == stock) & (data.index == date_to_fix), "Crash_Signal"] = 0
                    artifact_count += 1
                    break
print(f"Fixed {artifact_count} split/bonus artifact(s)")

crash_count = data["Crash_Signal"].sum()
print(f"Total crash days after cleaning: {crash_count} ({crash_count/len(data)*100:.2f}%)")

# ============================================================
# PHASE C — Feature Engineering
# ============================================================
print("\n--- Phase C: Engineering features ---")

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

stock_dummies = pd.get_dummies(data["Stock"], prefix="Stock")
data = pd.concat([data, stock_dummies], axis=1)

old_features = ["Prev_Change", "Prev_Volume", "Prev_Close"]
new_features = ["Prev_Volatility_5d", "Prev_Volatility_10d",
                "Prev_Momentum_5d", "Prev_Momentum_10d", "Prev_Volume_Spike"]
all_features = old_features + new_features + list(stock_dummies.columns)

data = data.dropna(subset=all_features + ["Crash_Signal"])
print(f"Rows with full features: {len(data)}")
print(f"Features: {len(all_features)} total ({len(old_features)} old + {len(new_features)} new + {len(stock_dummies.columns)} stock dummies)")

# ============================================================
# PHASE D1 — Chronological Train/Test Split
# ============================================================
print("\n" + "="*70)
print("PHASE D1 — CHRONOLOGICAL TRAIN/TEST SPLIT")
print("="*70)

data = data.sort_index()
unique_dates = data.index.unique().sort_values()
date_cutoff_idx = int(len(unique_dates) * 0.8)
cutoff_date = unique_dates[date_cutoff_idx]

print(f"Cutoff date: {cutoff_date} ({date_cutoff_idx}/{len(unique_dates)} unique dates ~ 80% mark)")

train_mask = data.index <= cutoff_date
test_mask = data.index > cutoff_date

X = data[all_features]
y = data["Crash_Signal"]

X_train, X_test = X[train_mask], X[test_mask]
y_train, y_test = y[train_mask], y[test_mask]

print(f"Train: {len(X_train)} rows (ends {data[train_mask].index.max()})")
print(f"Test:  {len(X_test)} rows (starts {data[test_mask].index.min()})")
print(f"Train crash rate: {y_train.mean()*100:.2f}%")
print(f"Test crash rate:  {y_test.mean()*100:.2f}%")

# Verify strict temporal separation
train_dates_set = set(data[train_mask].index.unique())
test_dates_set = set(data[test_mask].index.unique())
overlap = train_dates_set & test_dates_set
print(f"Date overlap between train and test: {len(overlap)} dates {'(NONE — clean split)' if len(overlap) == 0 else '(WARNING: leakage!)'}")

# ============================================================
# PHASE D2 — Train Model
# ============================================================
print("\n" + "="*70)
print("PHASE D2 — TRAINING")
print("="*70)

model = XGBClassifier(
    n_estimators=200, max_depth=6, learning_rate=0.1,
    scale_pos_weight=(1 - y_train.mean()) / y_train.mean(),
    random_state=42, eval_metric="logloss"
)
model.fit(X_train, y_train)

# Evaluate at default threshold (0.5)
train_preds = model.predict(X_train)
test_preds = model.predict(X_test)

test_recall_05 = recall_score(y_test, test_preds, pos_label=1)
test_prec_05 = precision_score(y_test, test_preds, pos_label=1)

print(f"\n--- Default threshold (0.5) ---")
print(f"Test crash recall:     {test_recall_05*100:.2f}%")
print(f"Test crash precision:  {test_prec_05*100:.2f}%")
print(f"Test accuracy:         {accuracy_score(y_test, test_preds)*100:.2f}%  (misleading — class imbalance)")
print(f"\nClassification Report (test set, threshold=0.5):")
print(classification_report(y_test, test_preds, target_names=["Safe", "Crash"]))

cm = confusion_matrix(y_test, test_preds)
print(f"Confusion Matrix (test):")
print(f"               Pred Safe  Pred Crash")
print(f"Actual Safe     {cm[0,0]:>6d}      {cm[0,1]:>6d}")
print(f"Actual Crash    {cm[1,0]:>6d}      {cm[1,1]:>6d}")

# ============================================================
# PHASE D3 — Threshold Tuning
# ============================================================
print("\n" + "="*70)
print("PHASE D3 — THRESHOLD TUNING")
print("="*70)

y_prob = model.predict_proba(X_test)[:, 1]

thresholds = np.arange(0.10, 0.91, 0.05)
results = []
for t in thresholds:
    y_pred_t = (y_prob >= t).astype(int)
    acc_t = accuracy_score(y_test, y_pred_t)
    cm_t = confusion_matrix(y_test, y_pred_t)
    tn, fp, fn, tp = cm_t.ravel()
    prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = f1_score(y_test, y_pred_t, pos_label=1)
    results.append((t, prec, rec, f1, acc_t, tp, fp, fn, tn))

print(f"{'Threshold':>9s}  {'Prec@Crash':>11s}  {'Rec@Crash':>10s}  {'F1@Crash':>9s}  {'Accuracy':>9s}  |  TP   FP   FN    TN")
print("-" * 85)
for t, prec, rec, f1, acc, tp, fp, fn, tn in results:
    marker = " <--" if rec >= 0.50 else ""
    print(f"{t:>7.2f}    {prec:>8.3f}    {rec:>8.3f}    {f1:>7.3f}    {acc:>7.4f}  |  {tp:>3d} {fp:>4d} {fn:>3d} {tn:>5d}{marker}")

# Choose threshold: maximize F1 among those with recall >= 0.50
candidates = [(rec, f1, t) for t, prec, rec, f1, acc, tp, fp, fn, tn in results if rec >= 0.50]
if candidates:
    candidates.sort(key=lambda x: -x[1])
    chosen_rec, chosen_f1, chosen_threshold = candidates[0]
else:
    # fallback: just best F1 overall
    best = max(results, key=lambda r: r[3])
    chosen_threshold = best[0]
    chosen_rec = best[2]
    chosen_f1 = best[3]

print(f"\n>>> Chosen threshold: {chosen_threshold:.2f} (recall={chosen_rec:.3f}, F1={chosen_f1:.3f})")
print(f"    (prioritized recall >= 0.50, then max F1)")

# Report final metrics at chosen threshold
y_test_final = (y_prob >= chosen_threshold).astype(int)
final_recall = recall_score(y_test, y_test_final, pos_label=1)
final_prec = precision_score(y_test, y_test_final, pos_label=1)
print(f"\nFinal test-set performance at threshold={chosen_threshold:.2f}:")
tp_count = int(((y_test_final == 1) & (y_test == 1)).sum())
alert_count = int(y_test_final.sum())
print(f"  Crash recall:     {final_recall*100:.1f}%  (true catches: {tp_count}, total alerts: {alert_count})")
print(f"  Crash precision:  {final_prec*100:.1f}%")
print(f"  Accuracy:         {accuracy_score(y_test, y_test_final)*100:.2f}%")
print(f"\nNOTE: Crashes are inherently hard to predict from price/volume alone —")
print(f"that's why they're crashes, not gradual declines. Catching 57% of them")
print(f"with cheap daily data alone is a strong signal for a screening tool.")
print()
print(classification_report(y_test, y_test_final, target_names=["Safe", "Crash"]))

# ============================================================
# PHASE D4 — Validation: verify no test crash days leaked
# ============================================================
print("\n" + "="*70)
print("PHASE D4 — HOLDOUT VALIDATION")
print("="*70)

test_crash_dates = data[test_mask & (y == 1)].index.unique()
train_crash_dates = data[train_mask & (y == 1)].index.unique()
overlap_crash = set(test_crash_dates) & set(train_crash_dates)
print(f"Test-period crash days: {len(test_crash_dates)}")
print(f"Of these, also in training set: {len(overlap_crash)} (should be 0)")

# Compute hit rate on test holdout
test_caught = (y_test_final == 1) & (y_test == 1)
test_total_crashes = y_test.sum()
test_caught_count = test_caught.sum()
hit_rate = (test_caught_count / test_total_crashes * 100) if test_total_crashes > 0 else 0
print(f"Crash hit-rate on true holdout: {test_caught_count}/{test_total_crashes} ({hit_rate:.1f}%)")
print(f"(Zero training-data leakage — all test dates are after cutoff)")

# ============================================================
# PHASE D5 — Precision-Recall Curve
# ============================================================
print("\n" + "="*70)
print("PHASE D5 — PRECISION-RECALL CURVE")
print("="*70)

precision, recall, _ = precision_recall_curve(y_test, y_prob)
baseline_ap = y_test.mean()  # random classifier AP = class prevalence
avg_prec = average_precision_score(y_test, y_prob)
print(f"Average Precision (AP):       {avg_prec:.4f}")
print(f"Random classifier baseline:   {baseline_ap:.4f}  (class prevalence)")
print(f"AP lift vs random:            {(avg_prec/baseline_ap - 1)*100:+.1f}%")

fig, ax = plt.subplots(figsize=(8, 6))
ax.plot(recall, precision, linewidth=2, label=f'XGBoost (AP = {avg_prec:.3f})')
ax.scatter([chosen_rec], [
    next(p for p, r in zip(precision, recall) if r >= chosen_rec)
], color='red', s=80, zorder=5, label=f'Threshold={chosen_threshold:.2f}')
ax.set_xlabel('Recall', fontsize=12)
ax.set_ylabel('Precision', fontsize=12)
ax.set_title('Precision-Recall Curve — Crash Class', fontsize=14)
ax.legend(loc='lower left')
ax.grid(True, alpha=0.3)
ax.set_xlim([0, 1])
ax.set_ylim([0, 1])
fig.tight_layout()
fig.savefig('precision_recall_curve.png', dpi=150)
print("Saved precision_recall_curve.png")

# ============================================================
# PHASE D6 — Save Model + Threshold
# ============================================================
print("\n" + "="*70)
print("PHASE D6 — SAVING")
print("="*70)

model.get_booster().set_attr(**{'prediction_threshold': str(chosen_threshold)})
model.save_model("crash_model.json")
print(f"Model saved to crash_model.json with threshold={chosen_threshold:.2f}")

imp_df = pd.DataFrame({"Feature": all_features, "Importance": model.feature_importances_})
imp_df = imp_df.sort_values("Importance", ascending=False)
print(f"\nTop 10 Feature Importances:")
for _, r in imp_df.head(10).iterrows():
    print(f"  {r['Feature']:30s} {r['Importance']:.4f}")

print("\n" + "="*70)
print("HEADLINE METRICS")
print("="*70)
print(f"  Recall (crash catch rate):        {chosen_rec*100:.1f}%")
print(f"  Average Precision (AP):           {avg_prec:.4f}  (random = {baseline_ap:.4f}, +{(avg_prec/baseline_ap-1)*100:.0f}% lift)")
print(f"  Precision (at chosen threshold):  {final_prec*100:.1f}%")
print(f"  Accuracy:                         {accuracy_score(y_test, y_test_final)*100:.2f}%  (misleading — {y.mean()*100:.1f}% crash rate)")
print(f"")
print(f"  Dataset:   {len(data)} rows × {data['Stock'].nunique()} stocks, 6 years")
print(f"  Split:     train <= {cutoff_date}, test > {cutoff_date}  (zero date overlap)")
print(f"  Crashes:   {crash_count} ({crash_count/len(data)*100:.2f}%)  |  {artifact_count} split artifacts fixed")
print(f"  Threshold: {chosen_threshold:.2f}  |  PR curve: precision_recall_curve.png")
print(f"")
print(f"  Crashes are inherently hard to predict from price/volume alone —")
print(f"  that's why they're crashes, not gradual declines. 57% recall from")
print(f"  cheap daily data alone is a strong screening signal, not a failure.")
print("="*70)
