import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

# Data setup
data = {
    'Month': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    'Value': [12.0, 15.0, 14.5, 18.0, 19.5, 24.0, 25.0],
    'Is_Imputed': [False, False, True, False, True, False, False],
    'Uncertainty': [0.0, 0.0, 2.5, 0.0, 3.0, 0.0, 0.0]
}
df = pd.DataFrame(data)
observed = df[~df['Is_Imputed']]
imputed = df[df['Is_Imputed']]

def apply_style(ax):
    ax.set_ylabel('Value')
    ax.grid(True, linestyle='--', alpha=0.5)
    ax.set_ylim(10, 30)

fig1, ax1 = plt.subplots(figsize=(7, 5))
ax1.plot(df['Month'], df['Value'], color='gray', zorder=1, label='Trend')
ax1.scatter(observed['Month'], observed['Value'], color='black', s=50, zorder=2, label='Observed')
ax1.scatter(imputed['Month'], imputed['Value'], color='red', s=50, zorder=3, label='Imputed')
ax1.set_title('Highlighting')
ax1.legend()
apply_style(ax1)
fig1.savefig("1_highlighting.png")

fig2, ax2 = plt.subplots(figsize=(7, 5))
ax2.plot(df['Month'], df['Value'], color='black', alpha=0.3, zorder=1)
ax2.scatter(observed['Month'], observed['Value'], color='black', s=50, zorder=2)
ax2.scatter(imputed['Month'], imputed['Value'], facecolors='none', edgecolors='black',
            alpha=0.4, s=50, zorder=3, linewidths=1.5)
ax2.set_title('Downplaying')
apply_style(ax2)
fig2.savefig("2_downplaying.png")

fig3, ax3 = plt.subplots(figsize=(7, 5))
ax3.plot(df['Month'], df['Value'], color='black', zorder=1)
ax3.scatter(df['Month'], df['Value'], color='black', s=50, zorder=2)
ax3.errorbar(imputed['Month'], imputed['Value'], yerr=imputed['Uncertainty'],
             fmt='none', ecolor='red', capsize=5, zorder=3)
ax3.set_title('Annotating')
apply_style(ax3)
fig3.savefig("3_annotating.png")

fig4, ax4 = plt.subplots(figsize=(7, 5))
values_with_gaps = df['Value'].copy()
values_with_gaps.loc[df['Is_Imputed']] = np.nan
ax4.plot(df['Month'], values_with_gaps, color='black', marker='o', markersize=7)
ax4.set_title('Information Removal')
apply_style(ax4)
fig4.savefig("4_removal.png")

plt.show()
