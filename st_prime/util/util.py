import os

import streamlit.components.v1 as components
from streamlit.components.v1.custom_component import CustomComponent

_RELEASE = False


def get_component_by_name(name: str) -> CustomComponent:
    if not _RELEASE:
        _component_func = components.declare_component(
            name,
            url="http://localhost:5173",
        )
    else:
        parent_dir = os.path.dirname(os.path.abspath(__file__))
        build_dir = os.path.join(parent_dir, "frontend/dist")
        _component_func = components.declare_component(
            name,
            path=build_dir
        )
    return _component_func
