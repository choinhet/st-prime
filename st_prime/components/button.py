import inspect
from typing import Optional

from st_prime.util.util import get_component_by_name


def button(name: str, key: Optional[str] = None):
    _component = get_component_by_name(inspect.stack()[0][3])
    component_value = _component(name=name, key=key, default=0)
    return component_value
