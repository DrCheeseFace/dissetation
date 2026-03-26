import pandas as pd
import numpy as np
import utils
from scipy.stats import wasserstein_distance
from sklearn.metrics import mean_absolute_error
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
    :param str file_path_base: path to base dataset
    :param str file_path_child: path to child dataset

    :return: json string representation of comparison info
    :rtype: str
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

    for i, column in enumerate(column_names):
        if column not in df_base.columns or column not in df_child.columns:
            continue

        base_clean = df_base[column].dropna()
        child_clean = df_child[column].dropna()

        # if after droping, everything is empty
        if base_clean.empty or child_clean.empty:
            col_info.append({
                column: {
                    "WD": None,
                    "MAD": None,
                }
            })
            continue

        # if catagorical, encode
        if not pd.api.types.is_numeric_dtype(base_clean) or not pd.api.types.is_numeric_dtype(child_clean):
            le = LabelEncoder()

            combined_data = pd.concat([base_clean, child_clean]).astype(str)
            le.fit(combined_data)

            base_clean = pd.Series(le.transform(
                base_clean.astype(str)), index=base_clean.index)
            child_clean = pd.Series(le.transform(
                child_clean.astype(str)), index=child_clean.index)

        aligned_df = pd.concat([base_clean, child_clean], axis=1).dropna()

        if aligned_df.empty:
            wd_val = wasserstein_distance(base_clean, child_clean)
            mae_val = None
        else:
            wd_val = wasserstein_distance(base_clean, child_clean)
            mae_val = mean_absolute_error(
                aligned_df.iloc[:, 0], aligned_df.iloc[:, 1])

        col_info.append({
            column: {
                "WD": wd_val,
                "MAD": mae_val,
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
