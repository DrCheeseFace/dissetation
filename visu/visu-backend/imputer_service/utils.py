import pandas as pd


def get_df_from_filename(filename):
    """
    :param str file_path: path to dataset
    :return: pandas dataframe
    :rtype: pandas datafram
    WARNING. ASSUMES filename exists
    """
    return pd.read_csv(filename)
