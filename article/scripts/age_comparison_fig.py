import pandas as pd
import matplotlib.pyplot as plt
import numpy as np  # Added for bin calculation
from scipy.stats import wasserstein_distance

file_path = 'out_small_datasets/MAR-heart-disease.csv'
df = pd.read_csv(file_path)

df['Age'] = pd.to_numeric(df['Age'], errors='coerce')

# --- Data Preparation ---
recorded_age = df['Age'].dropna()
missing_hd_age = df[df['Heart Disease'].isna()]['Age'].dropna()

# --- Syncing Bins ---
# We calculate global min/max to ensure both histograms share the same scale
min_age = recorded_age.min()
max_age = recorded_age.max()
# Creating 15 equal bins between the min and max age
bin_edges = np.linspace(min_age, max_age, 16) 

# --- Graph 1: Overall Recorded Age ---
plt.figure(figsize=(10, 6))
plt.hist(recorded_age, bins=bin_edges, color='blue', edgecolor='black', alpha=0.7)
plt.xlabel('Age', fontdict={'weight': 'bold', 'size': 22})
plt.ylabel('Frequency', fontdict={'weight': 'bold', 'size': 22})
plt.title('Distribution of Recorded Age', fontdict={'weight': 'bold', 'size': 22})
plt.xlim(min_age, max_age) # Fix x-axis limits
plt.grid(axis='y', linestyle='--', alpha=0.7)
plt.savefig('recorded_age_distribution.png')
print("Graph 1 saved: recorded_age_distribution.png")

# --- Graph 2: Age where Heart Disease is missing ---
plt.figure(figsize=(10, 6))
plt.hist(missing_hd_age, bins=bin_edges, color='red', edgecolor='black', alpha=0.7)
plt.xlabel('Age', fontdict={'weight': 'bold', 'size': 22})
plt.ylabel('Frequency', fontdict={'weight': 'bold', 'size': 22})
plt.title('Distribution of Age IF Heart Disease Data is Missing', fontdict={'weight': 'bold', 'size': 22})
plt.xlim(min_age, max_age) # Fix x-axis limits
plt.grid(axis='y', linestyle='--', alpha=0.7)
plt.savefig('missing_hd_age_distribution.png')
print("Graph 2 saved: missing_hd_age_distribution.png")

# --- Wasserstein Distance ---
if not missing_hd_age.empty:
    wd_score = wasserstein_distance(recorded_age, missing_hd_age)
    print(f"\nWasserstein Distance: {wd_score:.4f}")
else:
    print("\nNo missing values found in 'Heart Disease' to calculate distance.")
