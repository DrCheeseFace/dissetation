import pandas as pd


def get_df_from_filename(filename):
    """
    :param str file_path: path to dataset
    :return: pandas dataframe
    :rtype: pandas datafram
    WARNING. ASSUMES filename exists
    """
    return pd.read_csv(filename)


def save_to_csv(dst, df):
    """
    :param str file_path: path to dataset
    :return: pandas dataframe
    :rtype: pandas datafram
    WARNING. ASSUMES filename exists
    """
    df.to_csv(dst, index=False)
