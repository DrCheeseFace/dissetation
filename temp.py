import matplotlib.pyplot as plt

data = {
    'Cleaning and organising data': 0.6,
    'Collecting data sets': 0.19,
    'Mining data for patterns': 0.09,
    'Other': 0.05,
    'Refining algorithms': 0.04,
    'Building training sets': 0.03
}

# Sort data descending
sorted_data = dict(sorted(data.items(), key=lambda item: item[1], reverse=True))
sizes = list(sorted_data.values())
labels = list(sorted_data.keys())
legend_labels = [f'{l} ({s*100:.0f}%)' for l, s in sorted_data.items()]
colors = plt.cm.Paired.colors

# --- 1. Generate and Save the Pie Chart (No Legend) ---
fig_pie, ax_pie = plt.subplots(figsize=(8, 8))
explode = (0.1, 0, 0, 0, 0, 0)

wedges, _ = ax_pie.pie(
    sizes,
    shadow=True,
    explode=explode,
    startangle=140,
    colors=colors
)
ax_pie.axis('equal')
plt.tight_layout()

# Save the pie chart
fig_pie.savefig('pie_chart_only.svg', format='svg', bbox_inches='tight')

# --- 2. Generate and Save the Legend Only ---
# Create a small figure specifically for the legend
fig_leg, ax_leg = plt.subplots(figsize=(4, 3))
ax_leg.axis('off') # Hide the empty plot lines and axes

# Create the legend using the wedges from the pie chart to keep colors consistent
legend = ax_leg.legend(
    wedges, 
    legend_labels, 
    loc='center', 
    frameon=False, 
    title="Data Science Tasks",
    prop={'size': 12}
)

# Save the legend, ensuring the bounding box clips exactly to the legend content
fig_leg.savefig('legend_only.svg', format='svg', bbox_inches='tight')
