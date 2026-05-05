import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

data = {
    'Month': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    'Value': [12.0, 15.0, 14.5, 18.0, 19.5, 24.0, 25.0],
    'Is_Imputed': [False, False, True, False, True, False, False],
    'Uncertainty': [0.0, 0.0, 2.5, 0.0, 3.0, 0.0, 0.0]
}
df = pd.DataFrame(data)

fig, axes = plt.subplots(2, 2, figsize=(14, 10))
fig.suptitle('Visualization Methods for Imputed Data', fontsize=16)

ax1 = axes[0, 0]
ax1.plot(df['Month'], df['Value'], color='gray', zorder=1, label='Trend')

observed = df[~df['Is_Imputed']]
ax1.scatter(observed['Month'], observed['Value'],
            color='black', s=50, zorder=2, label='Observed')

imputed = df[df['Is_Imputed']]
ax1.scatter(imputed['Month'], imputed['Value'],
            color='red', s=50, zorder=3, label='Imputed')

ax1.set_title('1. Highlighting (Color Points)')
ax1.legend()

ax2 = axes[0, 1]
ax2.plot(df['Month'], df['Value'], color='black', alpha=0.3, zorder=1)
ax2.scatter(observed['Month'], observed['Value'],
            color='black', s=50, zorder=2)
ax2.scatter(imputed['Month'], imputed['Value'], facecolors='none', edgecolors='black',
            alpha=0.4, s=50, zorder=3, linewidths=1.5)

ax2.set_title('2. Downplaying (Unfilled Points)')

ax3 = axes[1, 0]
ax3.plot(df['Month'], df['Value'], color='black', zorder=1)
ax3.scatter(df['Month'], df['Value'], color='black', s=50, zorder=2)

ax3.errorbar(imputed['Month'], imputed['Value'], yerr=imputed['Uncertainty'],
             fmt='none', ecolor='red', capsize=5, zorder=3)

ax3.set_title('3. Annotating (Error Bars)')

ax4 = axes[1, 1]

values_with_gaps = df['Value'].copy()
values_with_gaps.loc[df['Is_Imputed']] = np.nan

ax4.plot(df['Month'], values_with_gaps,
         color='black', marker='o', markersize=7)
ax4.set_title('4. Information Removal (Data Absent)')

for ax in axes.flat:
    ax.set_ylabel('Value')
    ax.grid(True, linestyle='--', alpha=0.5)
    ax.set_ylim(10, 30)

plt.tight_layout()
fig.savefig("song.png")
