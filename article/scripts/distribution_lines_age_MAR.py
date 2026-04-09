import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

FILE_PATH = "out_datasets/MAR-heart-disease.csv"
TARGET_COLUMN = "Age"


def visualize_distribution_lines(file_path, column_name):
    try:
        df = pd.read_csv(file_path)
    except FileNotFoundError:
        print(f"Error: Could not find the file at {file_path}")
        return

    if column_name not in df.columns:
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) == 0:
            print("No numeric columns found to plot.")
            return
        column_name = numeric_cols[0]

    df_cleaned = df.dropna()

    plt.figure(figsize=(10, 6))

    sns.kdeplot(data=df,
                x=column_name,
                color='skyblue',
                label='Before Dropping NAs',
                fill=False)

    sns.kdeplot(data=df_cleaned,
                x=column_name,
                color='red',
                label='After Dropping NAs',
                fill=False)

    plt.title(f'Distribution Density of {column_name}: Before vs. After (MAR)')
    plt.xlabel(column_name.capitalize())
    plt.ylabel('Density')
    plt.legend()

    plt.tight_layout()

    output_filename = f'distribution_lines_{column_name}.png'
    plt.savefig(output_filename, dpi=300)
    print(f"Visualization saved as '{output_filename}'")


if __name__ == "__main__":
    visualize_distribution_lines(FILE_PATH, TARGET_COLUMN)
