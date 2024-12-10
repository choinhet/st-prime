import st_prime as sp
from st_prime.tests.resources import table_1

data = sp.datatable(table_1(), selection_mode="multiple", page_size=5)
