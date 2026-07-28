import yfinance as yf
import pandas as pd

stocks = ["RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "ADANIENT.NS"]

for stock in stocks:
    data = yf.download(stock, period="1y", interval="1d")
    
    # Daily % change
    data["Daily_Change_%"] = data["Close"].pct_change() * 100
    
    # 1 = crash day, 0 = safe day
    data["Crash_Signal"] = (data["Daily_Change_%"] < -2).astype(int)
    
    # Save
    filename = stock.replace(".NS", "") + "_data.csv"
    data.to_csv(filename)
    print(f"Saved {filename} with crash signals!")

print("\nPhase 1 Complete!")