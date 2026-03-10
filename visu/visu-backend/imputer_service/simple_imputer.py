import utils


def simple_imputer_service(src, dst, feature, strategy):
    """
    :param str src: path to dataset
    :param str dst: path to save dataset
    :param str feature: column name
    """

    try:
        df = utils.get_df_from_filename(src)
    except Exception as e:
        raise RuntimeError(f"Failed to load dataset from '{src}': {e}")

    if feature not in df.columns:
        raise KeyError(f"Feature '{feature}' is missing from the dataset.")

    imputers = {
        "mean": simple_imputer_mean,
        "median": simple_imputer_median,
        "mode": simple_imputer_mode
    }

    if strategy not in imputers:
        raise ValueError(f"Invalid strategy '{
                         strategy}'. Supported: 'mean', 'median', 'mode'")

    df = imputers[strategy](df, feature)

    try:
        utils.save_to_csv(dst, df)
    except Exception as e:
        raise RuntimeError(f"Failed to save dataset to '{dst}': {e}")


def simple_imputer_mean(df, feature):
    val = df[feature].mean()
    df[feature] = df[feature].fillna(val)
    return df


def simple_imputer_median(df, feature):
    val = df[feature].median()
    df[feature] = df[feature].fillna(val)
    return df


def simple_imputer_mode(df, feature):
    mode_series = df[feature].mode()
    if not mode_series.empty:
        df[feature] = df[feature].fillna(mode_series[0])
    return df
