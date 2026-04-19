import pandas as pd
import numpy as np
import utils
from scipy.stats import wasserstein_distance, ks_2samp, pearsonr, skew
from sklearn.metrics import mean_absolute_error, root_mean_squared_error
from sklearn.preprocessing import LabelEncoder


def get_missiG_info(filename):
    """
    :param str file_path: path to unimputed dataset
    :return: json string representation of info
    :rtype: str
    WARNING. ASSUMES filename exists
    """

    df = utils.get_df_from_filename(filename)
    return get_missiG_info_json(df)


def get_missiG_info_json(df):
    """
    DataFrameInfo -> json
    returns json formatted string containing column info, shape,
    and histograms/value distributions for both numeric and categorical columns
    """
    null_mask = df.isnull()
    null_counts = null_mask.sum()
    column_names = df.columns.tolist()
    total_rows, total_cols = df.shape

    joint_counts_matrix = null_mask.values.T.astype(
        int) @ null_mask.values.astype(int)

    columns_info = []
    HISTOGRAM_BIN_COUNT = 20

    for i, col in enumerate(column_names):
        total_col_nulls = int(null_counts.iloc[i])
        if total_col_nulls > 0:
            joint_missingness_values = [
                round(
                    float(
                        (joint_counts_matrix[i, j] / total_col_nulls)
                        * 100),
                    2)
                for j in range(total_cols)
            ]
        else:
            joint_missingness_values = [0.0] * total_cols

        col_info = {
            "index": i,
            "column_name": col,
            "dtype": str(df[col].dtype),
            "non_null_count": int(df.iloc[:, i].count()),
            "null_count": total_col_nulls,
            "joint_missingness": joint_missingness_values,
            "joint_missingness_histograms": [],
            "histogram": None
        }

        dropna_series = df.iloc[:, i].dropna()
        non_null_df = df[df[col].notnull()]

        if pd.api.types.is_numeric_dtype(df[col]):
            counts, bin_edges = np.histogram(
                dropna_series, bins=HISTOGRAM_BIN_COUNT)

            col_info["histogram"] = {
                "data_type": "numeric",
                "counts": counts.tolist(),
                "bin_edges": bin_edges.tolist()
            }

            bins_series = pd.cut(
                non_null_df[col], bins=bin_edges, include_lowest=True)

            for target_col_idx, target_col in enumerate(column_names):
                null_counts_per_bin = non_null_df[target_col].isnull().groupby(
                    bins_series, observed=False).sum()

                col_info["joint_missingness_histograms"].append({
                    "index": target_col_idx,
                    "target_column": target_col,
                    "data_type": "numeric",
                    "counts": null_counts_per_bin.values.tolist(),
                    "bin_edges": bin_edges.tolist()
                })

        else:
            val_counts = dropna_series.value_counts()
            col_info["histogram"] = {
                "data_type": "categorical",
                "counts": {
                    str(category): int(count)
                    for category, count in val_counts.items()
                }
            }

            for target_col_index, target_col in enumerate(column_names):
                null_counts_per_cat = non_null_df[target_col].isnull().groupby(
                    non_null_df[col]).sum()

                col_info["joint_missingness_histograms"].append({
                    "index": target_col_index,
                    "target_column": target_col,
                    "data_type": "categorical",
                    "counts": {str(k): int(v)
                               for k, v in null_counts_per_cat.items()}
                })

        columns_info.append(col_info)

    return {
        "columns": columns_info,
        "shape": [total_rows, total_cols]
    }


def get_basic_info(file_path):
    """
    :param str file_path: path to dataset
    """

    try:
        df = utils.get_df_from_filename(file_path)
        return get_basic_info_json(df)
    except Exception as e:
        raise RuntimeError(f"Failed to load dataset from '{file_path}': {e}")


def get_basic_info_json(df):
    """
    :param DataFrame df: pandas dataframe
     {
         name: string
         dtype: type
         non_null_count: int
         null_count: int
     }
    """
    null_mask = df.isnull()
    null_counts = null_mask.sum()
    total_rows, total_cols = df.shape

    columns_info = []
    column_names = df.columns.tolist()
    for i, column in enumerate(column_names):
        total_col_nulls = int(null_counts.iloc[i])
        col_info = {
            "index": i,
            "name": column,
            "dtype": str(df[column].dtype),
            "non_null_count": int(df.iloc[:, i].count()),
            "null_count": total_col_nulls,
        }

        columns_info.append(col_info)

    return {
        "columns": columns_info,
        "shape": [total_rows, total_cols]
    }


def get_sample(file_path, n):
    """
    :param str file_path: path to unimputed dataset
    :param int n: sample size
    :return: json string representation of info
    :rtype: str
    """

    try:
        df = utils.get_df_from_filename(file_path)
    except Exception as e:
        raise RuntimeError(f"Failed to load dataset from '{file_path}': {e}")

    df = df.sample(n).replace({np.nan: None})

    return df.sample(n).to_dict()


def get_comparison(file_path_base, file_path_child):
    """
    Compares a base dataset with an child dataset using various statistical metrics.

    :param str file_path_base: path to base dataset
    :param str file_path_child: path to child dataset
    :return: List of dictionaries containing comparison info per column
    :rtype: list
    """

    try:
        df_base = utils.get_df_from_filename(file_path_base)
    except Exception as e:
        raise RuntimeError(f"Failed to load dataset from '{
                           file_path_base}': {e}")
    try:
        df_child = utils.get_df_from_filename(file_path_child)
    except Exception as e:
        raise RuntimeError(f"Failed to load dataset from '{
                           file_path_child}': {e}")

    column_names = df_base.columns.tolist()
    col_info = []

    for column in column_names:
        if column not in df_child.columns:
            continue

        base_raw = df_base[column]
        child_raw = df_child[column]

        base_clean = base_raw.dropna()
        child_clean = child_raw.dropna()

        if base_clean.empty or child_clean.empty:
            col_info.append({
                column: {
                    "WD": None,
                    "KS_STAT": None,
                    "VAR_RATIO": None,
                    "SKEW_DIFF": None
                }
            })
            continue

        is_numeric = pd.api.types.is_numeric_dtype(
            base_clean) and pd.api.types.is_numeric_dtype(child_clean)

        if not is_numeric:
            le = LabelEncoder()
            combined = pd.concat([base_clean, child_clean]).astype(str)
            le.fit(combined)
            base_encoded = le.transform(base_clean.astype(str))
            child_encoded = le.transform(child_clean.astype(str))

            wd_val = wasserstein_distance(base_encoded, child_encoded)
            ks_stat, _ = ks_2samp(base_encoded, child_encoded)

            var_ratio = None
            skew_diff = None

        else:
            # Handling for Numeric Data
            base_encoded = base_clean.values
            child_encoded = child_clean.values

            wd_val = wasserstein_distance(base_encoded, child_encoded)
            ks_stat, _ = ks_2samp(base_encoded, child_encoded)

            var_base = np.var(base_encoded)
            var_ratio = np.var(child_encoded) / \
                var_base if var_base != 0 else None

            base_skew = skew(base_encoded)
            child_skew = skew(child_encoded)
            skew_diff = base_skew - child_skew

        col_info.append({
            column: {
                "WD": wd_val,
                "KS_STAT": ks_stat,
                "VAR_RATIO": var_ratio,
                "SKEW_DIFF": skew_diff
            }
        })

    return col_info


def get_rows(file_path, row_index):
    try:
        df = utils.get_df_from_filename(file_path)
    except Exception as e:
        raise RuntimeError(f"Failed to load dataset from '{
                           file_path}': {e}")

    return df.loc[row_index].rename(index=str).replace({np.nan: None}).to_dict()


def get_missing_matrix_info(file_path, max_rows=500, max_cols=100):
    """
    loads and downsamples the dataset
    """
    try:
        df = utils.get_df_from_filename(file_path)

        original_shape = df.shape

        if len(df) > max_rows:
            row_step = len(df) // max_rows
            df = df.iloc[::row_step]

        if len(df.columns) > max_cols:
            col_step = len(df.columns) // max_cols
            df = df.iloc[:, ::col_step]

        return get_missing_matrix_info_json(df, original_shape)
    except Exception as e:
        raise RuntimeError(f"Failed to load dataset from '{file_path}': {e}")


def get_missing_matrix_info_json(df: pd.DataFrame, original_shape: tuple):
    matrix_data = df.replace({np.nan: None}).values.tolist()
    columns = df.columns.tolist()

    return {
        "columns": columns,
        "data": matrix_data,
        "metadata": {
            "original_rows": original_shape[0],
            "original_cols": original_shape[1],
            "sampled_rows": len(df),
            "sampled_cols": len(df.columns)
        }
    }
