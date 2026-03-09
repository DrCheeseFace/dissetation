from sklearn.impute import SimpleImputer
import utils


def simple_imputer_service(src, dst, feature, strategy):
    """
    :param str src: path to dataset
    :param str dst: path to save dataset
    :param str feature: column name 
    :return: json string representation of imputations done
    :rtype: str
    WARNING. ASSUMES filename exists
    """

    # TODO check strategy error handling
    df = utils.get_df_from_filename(filename)
    info = simple_imputer(df, feature, strategy)
    # TODO save to dst
    print(info)

    return


def simple_imputer(df, feature, strategy):
    """
    :param DataFrame df: pandas dataframe
    :param str feature: column name
    :param str strategy: strategy to be used for imputation 
    :return: json string representation of info
    :rtype: str
    WARNING. ASSUMES filename exists
    """
    print("hello, world!")
    return "TODO TEMP"
