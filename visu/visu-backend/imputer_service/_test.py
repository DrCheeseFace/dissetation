import numpy as np
import pandas as pd
import json


def get_dataframe_info_json(df):
    """
    DataFrameInfo -> json
    Uses matrix multiplication for joint missingness and pre-calculates masks.
    """
    null_mask = df.isnull()
    null_counts = null_mask.sum()
    column_names = df.columns.tolist()
    total_rows, total_cols = df.shape

    joint_counts_matrix = null_mask.values.T.astype(
        int) @ null_mask.values.astype(int)

    columns_info = []
    HISTOGRAM_BIN_COUNT = 10

    for i, col in enumerate(column_names):
        total_col_nulls = int(null_counts.iloc[i])
        col_null_mask = null_mask.iloc[:, i]

        if total_col_nulls > 0:
            joint_missingness_values = [
                round(
                    float((joint_counts_matrix[i, j] / total_col_nulls) * 100), 2)
                for j in range(total_cols)
            ]
        else:
            joint_missingness_values = [0.0] * total_cols

        jm_histograms = []
        if total_col_nulls > 0:
            for j, other_col in enumerate(column_names):
                if i == j:
                    continue

                missing_subset = df.iloc[:, j][col_null_mask].dropna()
                if missing_subset.empty:
                    continue

                if pd.api.types.is_numeric_dtype(df[other_col]):
                    _, global_bin_edges = np.histogram(
                        df[other_col].dropna(), bins=HISTOGRAM_BIN_COUNT)
                    counts, _ = np.histogram(
                        missing_subset, bins=global_bin_edges)

                    jm_histograms.append({
                        "target_column": other_col,
                        "data_type": "numeric",
                        "counts": counts.tolist(),
                        "bin_edges": global_bin_edges.tolist()
                    })
                elif pd.api.types.is_object_dtype(df[other_col]) or \
                        pd.api.types.is_bool_dtype(df[other_col]) or \
                        isinstance(df[other_col].dtype, pd.CategoricalDtype):

                    val_counts = missing_subset.value_counts()
                    jm_histograms.append({
                        "target_column": other_col,
                        "data_type": "categorical",
                        "counts": {str(k): int(v) for k, v in val_counts.items()}
                    })

        col_info = {
            "column_name": col,
            "dtype": str(df[col].dtype),
            "non_null_count": int(df.iloc[:, i].count()),
            "null_count": total_col_nulls,
            "joint_missingness": joint_missingness_values,
            "joint_missingness_histograms": jm_histograms,
            "histogram": None
        }

        dropna_series = df.iloc[:, i].dropna()
        if not dropna_series.empty:
            if pd.api.types.is_numeric_dtype(df[col]):
                counts, bin_edges = np.histogram(
                    dropna_series, bins=HISTOGRAM_BIN_COUNT)
                col_info["histogram"] = {
                    "data_type": "numeric",
                    "counts": counts.tolist(),
                    "bin_edges": bin_edges.tolist()
                }
            else:
                val_counts = dropna_series.value_counts()
                col_info["histogram"] = {
                    "data_type": "categorical",
                    "counts": {str(category): int(count) for category, count in val_counts.items()}
                }

        columns_info.append(col_info)

    return json.dumps({
        "status": "success",
        "info": {
            "columns": columns_info,
            "shape": [total_rows, total_cols]
        },
        "message": "DataFrame information retrieved successfully"
    }, indent=4)


df = pd.read_csv('./testdata/MAR-heart-disease.csv')
print(get_dataframe_info_json(df))
