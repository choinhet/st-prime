import json
import logging
from typing import Optional, Literal, List, Callable

import pandas as pd

from st_prime.util.util import get_component_by_name

COMPONENT = "datatable"

log = logging.getLogger("st_prime")

SelectionModes = Literal["single", "multiple", "checkbox", "radiobutton"]


def datatable(
        data: pd.DataFrame,
        frozen_columns: Optional[List[str]] = None,
        frozen_rows: Optional[List[int]] = None,
        key: Optional[str] = None,
        page_size: int = 10,
        pagination: bool = True,
        row_editor: bool = False,
        scroll_height: Optional[str] = None,
        scrollable: bool = False,
        search_bar: bool = True,
        search_placeholder: str = "Search",
        selection_callback: Optional[Callable[[List[int]], None]] = None,
        selection_mode: SelectionModes = "single",
        striped_rows: bool = False,
        sortable: bool = True,
        width: Optional[str] = None,
) -> pd.DataFrame:
    _component = get_component_by_name(COMPONENT)
    columns = [{"field": col, "header": col} for col in data.columns]
    data_dict = data.to_dict(orient="records")

    result = _component(
        data=data_dict,
        columns=columns,
        frozenColumns=frozen_columns,
        frozenRows=frozen_rows,
        search=search_bar,
        rowEditor=row_editor,
        searchPlaceholder=search_placeholder,
        hasSelectionCallback=bool(selection_callback),
        key=key,
        pagination=pagination,
        pageSize=page_size,
        sortable=sortable,
        scrollable=scrollable,
        scrollHeight=scroll_height,
        selectionMode=selection_mode,
        stripedRows=striped_rows,
        maxWidth=width,
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
