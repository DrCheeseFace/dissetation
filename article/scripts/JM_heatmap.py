import pandas as pd
import missingno as msno

collisions = pd.read_csv("out_datasets/JM-heart-disease.csv")
fig = msno.heatmap(collisions, cbar=False, fontsize=30)
fig_copy = fig.get_figure()
fig_copy.savefig('JM.png', bbox_inches='tight')
