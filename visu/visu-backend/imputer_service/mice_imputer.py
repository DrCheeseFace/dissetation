import pandas as pd
import numpy as np
import utils
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import IterativeImputer
from sklearn.ensemble import RandomForestRegressor


def mice_imputer_service(app, src, dst):
    """
    :param str src: path to dataset
    :param str dst: path to save dataset
    """

    try:
        df = utils.get_df_from_filename(src)
    except Exception as e:
        raise RuntimeError(f"Failed to load dataset from '{src}': {e}")

    app.logger.info("Starting preprocessing for categorical data")

    # Select anything that isn't a number
    categorical_cols = df.select_dtypes(exclude=[np.number]).columns
    mapping_dict = {}

    # convert categories to numbers
    for col in categorical_cols:
        codes, uniques = pd.factorize(df[col])

        codes = codes.astype(float)
        codes[codes == -1] = np.nan  # convert the -1 back to NaN for MICE

        df[col] = codes
        mapping_dict[col] = uniques

    df = df.astype(float)

    imputer = IterativeImputer(
        estimator=RandomForestRegressor(
            n_estimators=10, random_state=42),  # TODO check n_estimators
        max_iter=10,
        random_state=42
    ).set_output(transform="pandas")

    app.logger.info("Started MICE imputing")
    try:
        df_imputed = imputer.fit_transform(df)
    except Exception as e:
        app.logger.error(f"MICE fit_transform failed: {e}")
        raise e
    app.logger.info("Done MICE imputing")

    # decode the categorical columns back
    for col, uniques in mapping_dict.items():
        indices = df_imputed[col].round().clip(0, len(uniques) - 1).astype(int)
        df_imputed[col] = uniques[indices]

    try:
        utils.save_to_csv(dst, df_imputed)
    except Exception as e:
        raise RuntimeError(f"Failed to save dataset to '{dst}': {e}")
