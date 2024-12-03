import logging
import random
import string
from datetime import datetime, timedelta

import pandas as pd
import streamlit as st

import st_prime as sp

log = logging.getLogger(__name__)

st.set_page_config(layout="wide")


@st.cache_data
def table_content() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "Numbers": list(range(100)),
            "Letters": [
                "".join(random.choices(string.ascii_letters, k=4)) for _ in range(100)
            ],
        }
    )


@st.cache_data
def table_content_with_date() -> pd.DataFrame:
    base_date = datetime(2020, 12, 31)
    return pd.DataFrame(
        {
            "Numbers": [1, 2, 3, 4, 5],
            "Words": ["one", "two", "three", "four", "five"],
            "Date": [base_date + timedelta(days=i) for i in range(5)],
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
def table_bigger_content() -> pd.DataFrame:
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


def all_components():
    button1 = sp.button("Button 1")
    if button1:
        st.toast("Button 1 clicked")

    data = sp.datatable(table_content(), selection_mode="multiple", page_size=5)

    row_editor = sp.datatable(
        table_content_with_date(),
        row_editor=True,
        search_bar=False,
        scrollable=True,
        striped_rows=True,
        scroll_height="300px",
    )

    data2 = sp.datatable(
        table_bigger_content(),
        frozen_columns=["Till_100", "small"],
        frozen_rows=[0],
        pagination=False,
        search_bar=False,
        scrollable=True,
        scroll_height="400px",
        width="600px",
    )

    log.info(f"{data=}")
    log.info(f"{row_editor=}")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    all_components()
