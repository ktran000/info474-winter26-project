import pandas as pd

# Load raw data
df = pd.read_csv("happiness_data.csv")

# Select and rename needed columns
df_clean = df[[
    "Country name",
    "Regional indicator",
    "Ladder score",
    "Logged GDP per capita",
    "Healthy life expectancy",
    "Freedom to make life choices",
    "Social support"
]].rename(columns={
    "Country name": "country",
    "Regional indicator": "region",
    "Ladder score": "happiness",
    "Logged GDP per capita": "gdp",
    "Healthy life expectancy": "life_expectancy",
    "Freedom to make life choices": "freedom",
    "Social support": "social_support"
})

# Drop missing values
df_clean = df_clean.dropna()

# Save clean dataset
df_clean.to_csv("happiness_clean.csv", index=False)

print("Clean dataset created successfully.")