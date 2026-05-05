import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import io
import numpy as np

data = """Sample,Max HR
0,180
1,175
2,
3,165
4,160
5,
6,
7,145
8,140"""

df = pd.read_csv(io.StringIO(data))

df['Max HR'] = pd.to_numeric(df['Max HR'])
plt.style.use('ggplot')

plt.plot(df['Sample'], df['Max HR'], marker='o',
         color='blue', linewidth=2, label='Max HR')
plt.title("Absent Data")
plt.xlabel("Sample Index")
plt.ylabel("Max HR")
plt.ylim(0, 200)
plt.legend()
plt.tight_layout()
plt.savefig('costabile_absent.png')
plt.close()

plt.figure(figsize=(6, 5))
df_misleading = df.copy()
df_misleading['Max HR'] = df_misleading['Max HR'].fillna(0)
sns.lineplot(x=df_misleading.index,
             y=df_misleading['Max HR'], marker='o', color='red')
plt.title("Misleading Data")
plt.xlabel("Sample Index")
plt.ylabel("Max HR")
plt.tight_layout()
plt.savefig('costabile_misleading.png')
plt.close()

plt.figure(figsize=(6, 5))
plt.plot(df['Sample'], df['Max HR'], marker='o', color='green', linewidth=2)
is_next_present = df['Max HR'].notnull() & df['Max HR'].shift(1).isnull()
df.loc[0, 'Gap_Follows'] = False

is_recovery = (df['Max HR'].notnull()) & (df['Max HR'].shift(1).isna()) & (df.index > 0)
recovery_points = df[is_recovery]

for i, row in recovery_points.iterrows():
    plt.annotate('?', (row['Sample'], row['Max HR']),
                 textcoords="offset points", xytext=(0, 10),
                 ha='center', fontsize=14, color='darkorange', fontweight='bold')
    plt.scatter(row['Sample'], row['Max HR'], color='darkorange',
                s=200, facecolors='none', edgecolors='darkorange', linewidth=2)

plt.title("Coded")
plt.xlabel("Sample Index")
plt.ylabel("Max HR")
plt.ylim(130, 190)
plt.tight_layout()
plt.savefig('costabile_noise.png')
plt.close()
