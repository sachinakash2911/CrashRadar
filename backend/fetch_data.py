import yfinance as yf
import pandas as pd
import time

stocks = [
    "RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "ADANIENT.NS",
    "ICICIBANK.NS", "SBIN.NS", "HINDUNILVR.NS", "ITC.NS", "KOTAKBANK.NS",
    "BAJFINANCE.NS", "BHARTIARTL.NS", "WIPRO.NS", "MARUTI.NS",
    "ASIANPAINT.NS", "TITAN.NS", "SUNPHARMA.NS", "NTPC.NS", "HCLTECH.NS",
    "LT.NS", "ONGC.NS", "POWERGRID.NS", "AXISBANK.NS", "ULTRACEMCO.NS"
]

for stock in stocks:
    try:
        data = yf.download(stock, start="2020-01-01", end="2026-07-27", auto_adjust=True, progress=False)
        
        if data.empty:
            print(f"WARNING: No data for {stock}, skipping")
            continue

        # Flatten multi-level columns from yfinance
        if isinstance(data.columns, pd.MultiIndex):
            data.columns = data.columns.get_level_values(0)

        data["Daily_Change_%"] = data["Close"].pct_change() * 100
        data["Crash_Signal"] = (data["Daily_Change_%"] < -2).astype(int)

        filename = stock.replace(".NS", "") + "_data.csv"
        data.to_csv(filename)
        print(f"Saved {filename} — {len(data)} trading days")
    except Exception as e:
        print(f"ERROR for {stock}: {e}")

    time.sleep(0.5)  # be gentle with yahoo
