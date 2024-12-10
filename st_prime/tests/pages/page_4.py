import st_prime as sp
from st_prime.tests.resources import table_3

data2 = sp.datatable(
    table_3(),
    frozen_columns=["Till_100", "small"],
    frozen_rows=[0],
    pagination=False,
    search_bar=False,
    scrollable=True,
    scroll_height="400px",
    width="600px",
)
