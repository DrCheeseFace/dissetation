import numpy as np
import pandas as pd


df = pd.read_csv('./testdata/MAR-heart-disease.csv')

histo = np.histogram(df['Age'],
                     bins=10,
                     range=None,
                     density=None,
                     weights=None)

print(histo)
