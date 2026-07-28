import pandas as pd

df = pd.read_csv("RELIANCE_data.csv", header=[0,1], index_col=0)
df.columns = ['_'.join(col).strip() for col in df.columns]
print(df.columns.tolist())