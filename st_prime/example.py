import pandas as pd
import streamlit as st

import st_prime as sp

st.set_page_config(layout="wide")

if __name__ == "__main__":
    num_clicks = sp.button("Click Me!")
    st.write(f"Clicked {num_clicks} times")
    data = pd.DataFrame({"a": [1, 2, 3], "b": [4, 5, 6]})
    data = sp.datatable(data)
    print(data)
