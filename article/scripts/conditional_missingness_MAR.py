import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

FILE_PATH = "./out_small_datasets/MAR-heart-disease.csv"
COL = "Max HR"
df = pd.read_csv(FILE_PATH)

age_recorded = df[df[COL].notna()]['Age']

age_missing = df[df[COL].isna()]['Age']

all_ages = df['Age'].dropna()
bins = np.linspace(all_ages.min(), all_ages.max(), 25)

plt.hist(age_recorded, bins=bins, alpha=0.5, label='max hr: Recorded',
         color='steelblue', edgecolor='white')
plt.hist(age_missing, bins=bins, alpha=0.5, label='max hr: Missing',
         color='darkorange', edgecolor='white')

plt.title('Age distribution with and without recorded "Max HR"', fontsize=14)
plt.xlabel('Age', fontsize=12)
plt.ylabel('Frequency', fontsize=12)
plt.legend(loc='upper right')
plt.grid(axis='y', linestyle='--', alpha=0.3)

plt.tight_layout()
plt.savefig('conditional_missingness_MAR.png')
