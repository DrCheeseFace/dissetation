import utils
from sklearn.impute import KNNImputer


def knn_imputer_service(app, src, dst, n_neighbors):
    """
    :param str src: path to dataset
    :param str dst: path to save dataset
    :param int n_neighbors:
    """

    try:
        df = utils.get_df_from_filename(src)
    except Exception as e:
        raise RuntimeError(f"Failed to load dataset from '{src}': {e}")

    imputer = KNNImputer(
        n_neighbors=n_neighbors,
        weights="uniform"
    ).set_output(transform="pandas")

    app.logger.info("started knn imputing")
    df = imputer.fit_transform(df)
    app.logger.info("done knn imputing")

    try:
        utils.save_to_csv(dst, df)
    except Exception as e:
        # TODO DEBUG func knn_imputer_service
        raise RuntimeError(f"Failed to save dataset to '{dst}': {e}")
