import json
import logging
from typing import Optional, Literal

import pandas as pd

from st_prime.util.util import get_component_by_name

COMPONENT = "datatable"

log = logging.getLogger("st_prime")


def datatable(
        data: pd.DataFrame,
        search_bar: bool = True,
        row_editor: bool = False,
        search_placeholder: str = "Search",
        key: Optional[str] = None,
        pagination: bool = True,
        page_size: int = 10,
        sortable: bool = True,
        selection_callback: Optional[callable] = None,
        selection_mode: Literal["single", "multiple",
        "checkbox", "radiobutton"] = "single",
):
    _component = get_component_by_name(COMPONENT)
    columns = [{"field": col, "header": col} for col in data.columns]
    data_dict = data.to_dict(orient="records")

    result = _component(
        data=data_dict,
        columns=columns,
        search=search_bar,
        rowEditor=row_editor,
        searchPlaceholder=search_placeholder,
        key=key,
        pagination=pagination,
        pageSize=page_size,
        sortable=sortable,
        selectionMode=selection_mode,
        comp=COMPONENT
    )

    if result:
        result = json.loads(result)
        table_data = result.get("content", [])
        table_data = pd.DataFrame(table_data)

        if selection_callback:
            selection_callback(result.get("selection", []))

        return table_data
    return data
