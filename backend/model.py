import pandas as pd
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import pickle

stocks = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "ADANIENT"]

all_data = []
for stock in stocks:
    df = pd.read_csv(f"{stock}_data.csv", skiprows=[1], index_col=0)
    df["Stock"] = stock
    all_data.append(df)

data = pd.concat(all_data)

# Drop the empty first row
data = data.dropna(subset=["Close"])

# Features for AI to learn from
data["Prev_Change"] = data["Daily_Change_%"].shift(1)
data["Prev_Volume"] = data["Volume"].shift(1)
data["Prev_Close"] = data["Close"].shift(1)
data.dropna(inplace=True)

# What AI looks at vs what it predicts
X = data[["Prev_Change", "Prev_Volume", "Prev_Close"]]
y = data["Crash_Signal"]

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print(f"Training on {len(X_train)} rows, Testing on {len(X_test)} rows")

# Train model
model = XGBClassifier()
model.fit(X_train, y_train)

# Check accuracy
predictions = model.predict(X_test)
accuracy = accuracy_score(y_test, predictions)
print(f"Model Accuracy: {accuracy * 100:.2f}%")

# Save model
model.save_model("crash_model.json")
print("Model saved as crash_model.json!")