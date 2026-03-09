import pandas as pd
import numpy as np
import utils


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
