import st_prime as sp
import streamlit as st

button1 = sp.button("Button 1")
if button1:
    st.toast("Button 1 clicked")
