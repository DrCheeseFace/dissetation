import utils
from sklearn.impute import KNNImputer
# import pandas as pd


# TODO DEBUG func knn_imputer_service
def knn_imputer_service(src, dst, n_neighbors):
    """
    :param str src: path to dataset
    :param str dst: path to save dataset
    :param int n_neighbors:
    """

    try:
        df = utils.get_df_from_filename(src)
    except Exception as e:
        raise RuntimeError(f"Failed to load dataset from '{src}': {e}")

    df.columns = df.iloc[0]
    df = df.iloc[1:].reset_index(drop=True)
    # df = df.apply(pd.to_numeric, errors='coerce') # todo handle catagorical later
    df.columns = df.columns.astype(str)

    imputer = KNNImputer(n_neighbors=n_neighbors).set_output(
        transform="pandas")
    df = imputer.fit_transform(df)

    try:
        utils.save_to_csv(dst, df)
    except Exception as e:
        raise RuntimeError(f"Failed to save dataset to '{dst}': {e}")
