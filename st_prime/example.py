import logging
import random
import string

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
                "".join(random.choices(string.ascii_letters, k=4)) for _
                in range(100)
            ]
        }
    )


def all_components():
    button1 = sp.button("Button 1")
    if button1:
        st.toast("Button 1 clicked")

    data = sp.datatable(table_content(), page_size=5)
    row_editor = sp.datatable(
        table_content(),
        row_editor=True,
        search_bar=False,
    )
    log.info(f"{data=}")
    log.info(f"{row_editor=}")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    all_components()
