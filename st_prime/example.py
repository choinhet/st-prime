import streamlit as st

import st_prime as sp

st.set_page_config(layout="wide")

if __name__ == "__main__":
    num_clicks = sp.button("My name")
    st.write(f"Clicked {num_clicks} times")
