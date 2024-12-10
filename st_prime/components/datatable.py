import json
import logging
from typing import Collection, Optional, Literal, List, Callable, Dict, Any, Tuple, Type
from datetime import datetime, date

import pandas as pd
import numpy as np

from st_prime.util.util import get_component_by_name

COMPONENT = "datatable"

log = logging.getLogger("st_prime")

SelectionModes = Literal["single", "multiple", "checkbox", "radiobutton"]
DateConversion = Literal["date", "datetime", "none"]


def set_as_tuple(obj: Any) -> Tuple[Type, ...]:
    """Convert a single object or a collection to a tuple of types."""
    if not isinstance(obj, type):
        obj = type(obj)
    if isinstance(obj, Collection):
        return tuple(obj)
    return (obj,)


def serialize_value(value):
    """Convert numpy/pandas types to Python native types for JSON serialization."""
    type_map = {
        np.integer: int,
        np.floating: float,
        np.bool_: bool,
        (pd.Timestamp, datetime, date): lambda x: x.isoformat(),
        list: lambda x: [serialize_value(item) for item in x],
        dict: lambda x: {k: serialize_value(v) for k, v in x.items()},
        pd.NA: lambda x: None,
        pd.NaT: lambda x: None,
        pd.DataFrame: lambda x: x.to_dict(orient="records"),
    }

    for types, converter in type_map.items():
        if isinstance(value, set_as_tuple(types)):
            return converter(value)
    return value


def is_iso_date_string(value: Any) -> bool:
    """Check if a string is in ISO date format."""
    try:
        if not isinstance(value, str):
            return False
        try:
            date.fromisoformat(value)
            return True
        except ValueError:
            datetime.fromisoformat(value)
            return True
    except (ValueError, TypeError):
        return False


def detect_column_types(
    df: pd.DataFrame, date_conversion: DateConversion = "date"
) -> Dict[str, str]:
    type_map = {}
    for column in df.columns:
        series = df[column]
        if pd.api.types.is_datetime64_any_dtype(series):
            type_map[column] = "datetime" if date_conversion == "datetime" else "date"
        elif pd.api.types.is_bool_dtype(series):
            type_map[column] = "boolean"
        elif pd.api.types.is_integer_dtype(series):
            type_map[column] = "integer"
        elif pd.api.types.is_float_dtype(series):
            type_map[column] = "float"
        elif isinstance(series.iloc[0], list):
            # Detect list type
            if all(
                all(isinstance(x, (int, np.integer)) for x in lst)
                for lst in series
                if isinstance(lst, list)
            ):
                type_map[column] = "list_integer"
            elif all(
                all(isinstance(x, (float, np.floating)) for x in lst)
                for lst in series
                if isinstance(lst, list)
            ):
                type_map[column] = "list_float"
            else:
                type_map[column] = "list_string"
        else:
            # Try to detect if it's a date string
            try:
                first_value = series.iloc[0]
                if isinstance(first_value, str) and is_iso_date_string(first_value):
                    type_map[column] = (
                        "datetime" if date_conversion == "datetime" else "date"
                    )
                else:
                    type_map[column] = "string"
            except:
                type_map[column] = "string"
    return type_map


def get_distinct_values(df: pd.DataFrame, column: str) -> List[Any]:
    series = df[column]
    if isinstance(series.iloc[0], list):
        # Flatten list values and get unique items
        flattened = [
            serialize_value(item) for sublist in series.dropna() for item in sublist
        ]
        return list(set(flattened))
    return [serialize_value(x) for x in series.unique() if not pd.isna(x)]


def preprocess_dataframe(
    df: pd.DataFrame, column_types: Dict[str, str], date_conversion: DateConversion
) -> pd.DataFrame:
    """Preprocess the dataframe to ensure proper date formatting and type handling."""
    if date_conversion == "none":
        return df

    df = df.copy()
    for column, col_type in column_types.items():
        if col_type in ["date", "datetime"]:
            try:
                # Convert to datetime first
                df[column] = pd.to_datetime(df[column])

                if col_type == "date":
                    # If date type, convert to date only
                    df[column] = df[column].dt.date

                # Format as ISO string
                df[column] = df[column].apply(
                    lambda x: x.isoformat() if pd.notnull(x) else None
                )
            except:
                # If conversion fails, leave as is
                pass
    return df


def datatable(
    data: pd.DataFrame,
    frozen_columns: Optional[List[str]] = None,
    frozen_rows: Optional[List[int]] = None,
    key: Optional[str] = None,
    page_size: int = 10,
    pagination: bool = True,
    row_editor: bool = False,
    cell_editor: bool = False,
    scroll_height: Optional[str] = None,
    scrollable: bool = False,
    search_bar: bool = True,
    search_placeholder: str = "Search",
    selection_callback: Optional[Callable[[List[int]], None]] = None,
    selection_mode: SelectionModes = "single",
    striped_rows: bool = False,
    sortable: bool = True,
    size: Optional[Literal["small", "medium", "large"]] = None,
    width: Optional[str] = None,
    date_format: str = "%m/%d/%Y",
    date_conversion: DateConversion = "date",
) -> pd.DataFrame:
    _component = get_component_by_name(COMPONENT)

    # Detect column types
    column_types = detect_column_types(data, date_conversion)

    # Preprocess the dataframe
    processed_data = preprocess_dataframe(data, column_types, date_conversion)

    # Get distinct values for each column
    distinct_values = {
        col: get_distinct_values(processed_data, col)
        for col in processed_data.columns
        if column_types[col]
        in ["integer", "float", "string", "list_integer", "list_float", "list_string"]
    }

    columns = [
        {
            "field": col,
            "header": col,
            "type": column_types[col],
            "distinctValues": distinct_values.get(col, []),
        }
        for col in processed_data.columns
    ]

    # Convert DataFrame to dict with serialized values
    data_dict = []
    for _, row in processed_data.iterrows():
        row_dict = {}
        for col in processed_data.columns:
            row_dict[col] = serialize_value(row[col])
        data_dict.append(row_dict)

    size = size or "medium"
    result = _component(
        data=data_dict,
        columns=columns,
        frozenColumns=frozen_columns,
        frozenRows=frozen_rows,
        search=search_bar,
        cellEditor=cell_editor,
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
        size=size,
        maxWidth=width,
        dateFormat=date_format,
        comp=COMPONENT,
    )

    if result:
        result = json.loads(result)
        table_data = result.get("content", [])
        table_data = pd.DataFrame(table_data)

        if selection_callback:
            selection_callback(result.get("selection", []))

        return table_data
    return processed_data
