import json
import pandas as pd
import numpy as np


def get_unimputed_dataset_info(filename):
    """
    :param str file_path: path to unimputed dataset
    :return: json string representation of info
    :rtype: str
    WARNING. ASSUMES filename exists
    """

    df = pd.read_csv(filename)
    return get_dataframe_info_json(df)


def get_dataframe_info_json(df):
    """
    DataFrameInfo -> json
    returns json formatted string containing column info, shape,
    and histograms/value distributions for both numeric and categorical columns
    """
    columns_info = []
    HISTOGRAM_BIN_COUNT = 10

    for col in df.columns:
        col_info = {
            "column_name": col,
            "dtype": str(df[col].dtype),
            "non_null_count": int(df[col].count()),
            "null_count": int(df[col].isnull().sum())
        }

        dropna_series = df[col].dropna()

        if pd.api.types.is_numeric_dtype(df[col]):
            if not dropna_series.empty:
                counts, bin_edges = np.histogram(
                    dropna_series,
                    bins=HISTOGRAM_BIN_COUNT,
                    range=None,
                    density=None,
                    weights=None
                )
                col_info["histogram"] = {
                    "data_type": "numeric",
                    "counts": counts.tolist(),
                    "bin_edges": bin_edges.tolist()
                }
            else:
                col_info["histogram"] = None

        elif pd.api.types.is_object_dtype(df[col]) or \
                pd.api.types.is_bool_dtype(df[col]) or \
                isinstance(df[col].dtype, pd.CategoricalDtype):

            if not dropna_series.empty:
                val_counts = dropna_series.value_counts()

                col_info["histogram"] = {
                    "data_type": "categorical",
                    "counts": {str(category): int(count)
                               for category, count in val_counts.items()}
                }
            else:
                col_info["histogram"] = None

        else:
            col_info["histogram"] = None

        columns_info.append(col_info)

    info_dict = {
        "columns": columns_info,
        "shape": df.shape
    }

    return json.dumps(info_dict, indent=4)
