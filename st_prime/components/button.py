from typing import Optional

from st_prime.util.util import get_component_by_name

COMPONENT = "button"


def button(name: str, key: Optional[str] = None):
    _component = get_component_by_name(COMPONENT)
    component_value = _component(
        name=name,
        key=key,
        default=0,
        comp=COMPONENT
    )
    return component_value
