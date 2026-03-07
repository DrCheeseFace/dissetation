import json
import pandas as pd


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
    returns json formatted string
    """
    info_dict = {
        "columns": [
            {
                "column_name": col,
                "dtype": str(df[col].dtype),
                "non_null_count": int(df[col].count()),
                "null_count": int(df[col].isnull().sum())
            } for col in df.columns
        ],
        "shape": df.shape
    }

    return json.dumps(info_dict, indent=4)
