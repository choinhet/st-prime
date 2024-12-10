import logging
import streamlit as st
import sys
import os


log = logging.getLogger("st_prime.tests")


def add_upward_path(filename: str, level: int):
    """Add the upward path to the system path."""
    root_path = os.path.abspath(filename)
    for _ in range(level):
        root_path = os.path.dirname(root_path)
    log.info(f"Adding upward path: {root_path}")
    sys.path.append(root_path)


add_upward_path(__file__, 3)

st.set_page_config(layout="wide")
st.write("Streamlit Prime Tests")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
