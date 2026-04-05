import pandas as pd
import random
import numpy as np

IN_DATASOURCE_PATH = "./datasets/heart-disease.csv"
OUT_MCAR_DATASOURCE_PATH = "./out_datasets/MCAR-heart-disease.csv"
OUT_MCAR_VARIED_DATASOURCE_PATH = "./out_datasets/MCAR-VARIED-heart-disease.csv"
OUT_MAR_DATASOURCE_PATH = "./out_datasets/MAR-heart-disease.csv"
OUT_MNAR_DATASOURCE_PATH = "./out_datasets/MNAR-heart-disease.csv"

OUT_SMALL_MCAR_DATASOURCE_PATH = "./out_small_datasets/MCAR-heart-disease.csv"
OUT_SMALL_MCAR_VARIED_DATASOURCE_PATH = "./out_small_datasets/MCAR-VARIED-heart-disease.csv"
OUT_SMALL_MAR_DATASOURCE_PATH = "./out_small_datasets/MAR-heart-disease.csv"
OUT_SMALL_MNAR_DATASOURCE_PATH = "./out_small_datasets/MNAR-heart-disease.csv"

RANDOM_SEED = 99
np.random.seed(RANDOM_SEED)
random.seed(RANDOM_SEED)

base_dataframe = pd.read_csv(IN_DATASOURCE_PATH)

# drop id column if it exists
if 'id' in base_dataframe.columns:
    base_dataframe = base_dataframe.drop(columns=['id'])

# heart disease already mapped

mappings = {
    "Sex": {1: "Male", 0: "Female"},
    "Chest pain type": {
        1: "Typical Angina",
        2: "Atypical Angina",
        3: "Non-Anginal Pain",
        4: "Asymptomatic"
    },
    "FBS over 120": {1: "yes", 0: "no"},
    "EKG results": {
        0: "Normal",
        1: "ST-T Wave Abnormality",
        2: "Left Ventricular Hypertrophy"
    },
    "Exercise angina": {1: "Yes", 0: "No"},
    "Slope of ST": {
        1: "Upsloping",
        2: "Flat",
        3: "Downsloping"
    },
    "Thallium": {
        3: "Normal",
        6: "Fixed Defect",
        7: "Reversible Defect"
    },
    "Heart Disease": {"Absence": "No Disease", "Presence": "Heart Disease"}
}

for col, mapper in mappings.items():
    if col in base_dataframe.columns:
        base_dataframe[col] = base_dataframe[col].map(mapper).astype(str)

small_base_dataframe = base_dataframe.sample(
    n=10000, replace=True, random_state=RANDOM_SEED).reset_index(drop=True)


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

# MCAR varied
MCAR_varied_df = base_dataframe.copy().astype(object)
COL_WEIGHTS = {
    "Age": 0.40,
    "BP": 0.2,
    "Cholesterol": 0.25,
    "Max HR": 0.3
}

for col in MCAR_varied_df.columns:
    rate = COL_WEIGHTS.get(col, np.random.uniform(0.05, 0.35))
    random_draw = np.random.rand(len(MCAR_varied_df)) < rate
    MCAR_varied_df.loc[random_draw, col] = np.nan

MCAR_varied_df.to_csv(OUT_MCAR_VARIED_DATASOURCE_PATH, index=False)

# MAR
# if age > 55 missing
#   "max hr" missing at rate of 0.7
#   "st depression" missing at rate of 0.6
#   "heart disease" missing at rate of 0.5

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

# if heart disease, 50% missing
disease_mask = base_dataframe["Heart Disease"] == 1
MNAR_dataframe.loc[disease_mask & (np.random.rand(
    len(MNAR_dataframe)) < 0.5), "Heart Disease"] = np.nan

MNAR_dataframe.to_csv(OUT_MNAR_DATASOURCE_PATH, index=False)


# MCAR small
MCAR_small_df = small_base_dataframe.copy().astype(object)
COL_WEIGHTS_SMALL = {
    "Heart Disease": 0.40,
    "Cholesterol": 0.25,
    "BP": 0.15,
    "Thallium": 0.30
}

for col in MCAR_small_df.columns:
    rate = COL_WEIGHTS_SMALL.get(col, np.random.uniform(0.05, 0.35))
    random_draw = np.random.rand(len(MCAR_small_df)) < rate
    MCAR_small_df.loc[random_draw, col] = np.nan

MCAR_small_df.to_csv(OUT_SMALL_MCAR_DATASOURCE_PATH, index=False)

# MCAR varied small
MCAR_varied_small_df = small_base_dataframe.copy().astype(object)
COL_WEIGHTS_VARIED_SMALL = {
    "Age": 0.40,
    "BP": 0.2,
    "Cholesterol": 0.25,
    "Max HR": 0.3
}

for col in MCAR_varied_small_df.columns:
    rate = COL_WEIGHTS_VARIED_SMALL.get(col, np.random.uniform(0.05, 0.35))
    random_draw = np.random.rand(len(MCAR_varied_small_df)) < rate
    MCAR_varied_small_df.loc[random_draw, col] = np.nan

MCAR_varied_small_df.to_csv(OUT_SMALL_MCAR_VARIED_DATASOURCE_PATH, index=False)

# MAR Small
# if age > 55 missing
#   "max hr" missing at rate of 0.7
#   "st depression" missing at rate of 0.6
#   "heart disease" missing at rate of 0.5

MAR_small_df = small_base_dataframe.copy().astype(object)
age_condition_small = MAR_small_df['Age'] > 55
shared_random_small = np.random.rand(len(MAR_small_df))

MAR_small_df.loc[age_condition_small & (
    shared_random_small < 0.7), "Max HR"] = np.nan
MAR_small_df.loc[age_condition_small & (
    shared_random_small < 0.6), "ST depression"] = np.nan
MAR_small_df.loc[age_condition_small & (
    shared_random_small < 0.5), "Heart Disease"] = np.nan

MAR_small_df.to_csv(OUT_SMALL_MAR_DATASOURCE_PATH, index=False)

# MNAR Small
# people with high bp or cholesterol missing data.

MNAR_small_df = small_base_dataframe.copy().astype(object)
high_chol_small = small_base_dataframe['Cholesterol'] > 250
high_bp_small = small_base_dataframe['BP'] > 140

MNAR_small_df.loc[high_chol_small & (np.random.rand(
    len(MNAR_small_df)) < 0.8), "Cholesterol"] = np.nan
MNAR_small_df.loc[high_bp_small & (np.random.rand(
    len(MNAR_small_df)) < 0.8), "BP"] = np.nan

# if heart disease, 50% missing
disease_mask_small = small_base_dataframe["Heart Disease"] == 1
MNAR_small_df.loc[disease_mask_small & (np.random.rand(
    len(MNAR_small_df)) < 0.5), "Heart Disease"] = np.nan

MNAR_small_df.to_csv(OUT_SMALL_MNAR_DATASOURCE_PATH, index=False)
