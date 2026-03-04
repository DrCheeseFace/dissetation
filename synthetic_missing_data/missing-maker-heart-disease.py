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
# change "Heart Disease" to boolean
base_dataframe["Heart Disease"] = base_dataframe["Heart Disease"] == "Presence"

# drop id column
base_dataframe = base_dataframe.drop(columns=['id'])

# ---

# create MCAR dataset
MCAR_dataframe = base_dataframe.copy().astype(object)

MCAR_RATE = 0.33
random_draw = np.random.rand(len(MCAR_dataframe)) < MCAR_RATE
MCAR_dataframe.loc[random_draw, "Heart Disease"] = np.nan

MCAR_dataframe.to_csv(OUT_MCAR_DATASOURCE_PATH, index=False)

# ---

# create MAR dataset
# if age > 60: 33% chance of "Heart Disease" missing
MAR_dataframe = base_dataframe.copy().astype(object)

MAR_RATE = 0.33
condition = MAR_dataframe['Age'] > 60
random_draw = np.random.rand(len(MAR_dataframe)) < MAR_RATE
mar_mask = condition & random_draw
MAR_dataframe.loc[mar_mask, "Heart Disease"] = np.nan

MAR_dataframe.to_csv(OUT_MAR_DATASOURCE_PATH, index=False)

# ---

# create MNAR dataset
# if "Heart Disease" == true; 33% chance of being missing

MNAR_dataframe = base_dataframe.copy().astype(object)

MNAR_RATE = 0.33
condition = MNAR_dataframe["Heart Disease"]
random_draw = np.random.rand(len(MNAR_dataframe)) < MAR_RATE
mar_mask = condition & random_draw
MAR_dataframe.loc[mar_mask, "Heart Disease"] = np.nan

MAR_dataframe.to_csv(OUT_MNAR_DATASOURCE_PATH, index=False)
