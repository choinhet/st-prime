from io import StringIO
from typing import Optional

import pandas as pd

from st_prime.util.util import get_component_by_name

COMPONENT = "datatable"


def datatable(
        data: pd.DataFrame,
        search_bar: bool = True,
        row_editor: bool = False,
        search_placeholder: str = "Search",
        key: Optional[str] = None,
):
    _component = get_component_by_name(COMPONENT)
    columns = [{"field": col, "header": col} for col in data.columns]
    data_dict = data.to_dict(orient="records")

    component_value = _component(
        data=data_dict,
        columns=columns,
        search=search_bar,
        rowEditor=row_editor,
        searchPlaceholder=search_placeholder,
        key=key,
        comp=COMPONENT
    )

    if not component_value:
        return data

    return pd.read_json(StringIO(component_value))
