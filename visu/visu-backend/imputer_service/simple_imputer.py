import utils


def simple_imputer_service(src, dst, feature, strategy):
    """
    :param str src: path to dataset
    :param str dst: path to save dataset
    :param str feature: column name
    WARNING. ASSUMES filenames src exists
    """

    try:
        df = utils.get_df_from_filename(src)
    except Exception as e:
        raise RuntimeError(f"Failed to load dataset from '{src}': {e}")

    if feature not in df:
        raise KeyError(f"Feature '{feature}' is missing from the dataset.")

    match strategy:
        case "mean":
            df = simple_imputer_mean(df, feature)
        case "median":
            df = simple_imputer_median(df, feature)
        case "mode":
            df = simple_imputer_mode(df, feature)
        case _:
            raise ValueError(f"Invalid strategy '{
                             strategy}'. Supported strategies are 'mean', 'median', and 'mode'.")

    try:
        utils.save_to_csv(dst, df)
    except Exception as e:
        raise RuntimeError(f"Failed to save dataset to '{dst}': {e}")

    return


def simple_imputer_mean(df, feature):
    """
    :param DataFrame df: pandas dataframe
    :param str feature: column name
    :return: Dataframe
    :rtype: Dataframe
    """

    try:
        df[feature] = df[feature].fillna(df[feature].mean())
    except TypeError:
        raise TypeError(f"Cannot calculate mean. Feature '{
                        feature}' contains non-numeric data.")
    except Exception as e:
        raise RuntimeError(
            f"An unexpected error occurred during mean imputation: {e}")

    return df


def simple_imputer_median(df, feature):
    """
    :param DataFrame df: pandas dataframe
    :param str feature: column name
    :return: Dataframe
    :rtype: Dataframe
    """

    try:
        df[feature] = df[feature].fillna(df[feature].median())
    except TypeError:
        raise TypeError(f"Cannot calculate median. Feature '{
                        feature}' contains non-numeric data.")
    except Exception as e:
        raise RuntimeError(
            f"An unexpected error occurred during median imputation: {e}")

    return df


def simple_imputer_mode(df, feature):
    """
    :param DataFrame df: pandas dataframe
    :param str feature: column name
    :return: Dataframe
    :rtype: Dataframe
    """

    try:
        mode_values = df[feature].mode()
        if mode_values.empty:
            raise ValueError(f"Cannot calculate mode. Feature '{
                             feature}' has no values to determine a mode.")
        df[feature] = df[feature].fillna(mode_values[0])
    except Exception as e:
        raise RuntimeError(
            f"An unexpected error occurred during mode imputation: {e}")

    return df
