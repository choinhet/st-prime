from typing import Optional

import streamlit as st

from st_prime.util.util import get_component_by_name

COMPONENT = "button"


def button(
        name: str,
        key: Optional[str] = None
):
    _component = get_component_by_name(COMPONENT)
    num_clicks = _component(
        name=name,
        key=key,
        default=0,
        comp=COMPONENT
    )

    click_key = key or name + "_clicks"
    if num_clicks != st.session_state.get(click_key, 0):
        st.session_state[click_key] = num_clicks
        return True
    st.session_state[click_key] = num_clicks
    return False
