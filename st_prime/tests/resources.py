from datetime import datetime
import streamlit as st
import pandas as pd


@st.cache_data
def table_1() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "Numbers": list(range(100)),
            "Letters": ["Aaaa"] * 25 + ["Bbbb"] * 25 + ["Cccc"] * 25 + ["Dddd"] * 25,
        }
    )


@st.cache_data
def table_2() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "Numbers": [1, 2, 3, 4, 5],
            "Words": ["one", "two", "three", "four", "five"],
            "Date": [datetime(2020, 12, 30)] * 5,
            "Lists": [
                ["One", "Two"],
                ["Three", "Four"],
                ["Five", "Six"],
                ["Seven", "Eight"],
                ["Nine", "Ten"],
            ],
        }
    )


@st.cache_data
def table_3() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "Till_100": list(range(1, 101)),
            "String Column A": [f"String {i}" for i in range(1, 101)],
            "A middle column with a really big name, that will hide a column next to it": [
                f"String {i}" for i in range(1, 101)
            ],
            "String Column C": [f"String {i}" for i in range(1, 101)],
            "small": [f"String {i}" for i in range(1, 101)],
        }
    )
