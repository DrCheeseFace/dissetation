import pandas as pd
import random
import numpy as np

IN_DATASOURCE_PATH = "./datasets/heart-disease.csv"
OUT_MCAR_DATASOURCE_PATH = "./out_datasets/MCAR-heart-disease.csv"
OUT_MAR_DATASOURCE_PATH = "./out_datasets/MAR-heart-disease.csv"
OUT_MNAR_DATASOURCE_PATH = "./out_datasets/MNAR-heart-disease.csv"

RANDOM_SEED = 99
np.random.seed(RANDOM_SEED)
random.seed(RANDOM_SEED)

base_dataframe = pd.read_csv(IN_DATASOURCE_PATH)

# drop id column if it exists
if 'id' in base_dataframe.columns:
    base_dataframe = base_dataframe.drop(columns=['id'])

# MCAR
MCAR_dataframe = base_dataframe.copy().astype(object)
COL_WEIGHTS = {
    "Heart Disease": 0.40,
    "Cholesterol": 0.25,
    "BP": 0.15,
    "Thallium": 0.30
}

for col in MCAR_dataframe.columns:
    rate = COL_WEIGHTS.get(col, np.random.uniform(0.05, 0.35))
    random_draw = np.random.rand(len(MCAR_dataframe)) < rate
    MCAR_dataframe.loc[random_draw, col] = np.nan

MCAR_dataframe.to_csv(OUT_MCAR_DATASOURCE_PATH, index=False)

# MAR
# Age > 55 missing "Max HR" and "ST depression"
MAR_dataframe = base_dataframe.copy().astype(object)

age_condition = MAR_dataframe['Age'] > 55
shared_random = np.random.rand(len(MAR_dataframe))

MAR_dataframe.loc[age_condition & (shared_random < 0.7), "Max HR"] = np.nan
MAR_dataframe.loc[age_condition & (
    shared_random < 0.6), "ST depression"] = np.nan
MAR_dataframe.loc[age_condition & (
    shared_random < 0.5), "Heart Disease"] = np.nan

MAR_dataframe.to_csv(OUT_MAR_DATASOURCE_PATH, index=False)

# MNAR
# People with High BP or Cholesterol missing data.
MNAR_dataframe = base_dataframe.copy().astype(object)
high_chol = base_dataframe['Cholesterol'] > 250
high_bp = base_dataframe['BP'] > 140

MNAR_dataframe.loc[high_chol & (np.random.rand(
    len(MNAR_dataframe)) < 0.8), "Cholesterol"] = np.nan
MNAR_dataframe.loc[high_bp & (np.random.rand(
    len(MNAR_dataframe)) < 0.8), "BP"] = np.nan

# if Heart Disease, 50% missing
disease_mask = base_dataframe["Heart Disease"] == "Presence"
MNAR_dataframe.loc[disease_mask & (np.random.rand(
    len(MNAR_dataframe)) < 0.5), "Heart Disease"] = np.nan

MNAR_dataframe.to_csv(OUT_MNAR_DATASOURCE_PATH, index=False)
