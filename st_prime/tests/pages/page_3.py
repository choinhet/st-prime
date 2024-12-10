import st_prime as sp
from st_prime.tests.resources import table_2

row_editor = sp.datatable(
    table_2(),
    row_editor=True,
    search_bar=False,
    scrollable=True,
    striped_rows=True,
    scroll_height="300px",
)
