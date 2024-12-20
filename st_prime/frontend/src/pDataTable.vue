<template>
  <DataTable v-model:filters="filters" v-model:editingRows="editingRows" v-model:selection="selectedRows" :value="data"
    :frozen-value="frozenRows" :paginator="Boolean(args.pagination)" :rows="args.pageSize"
    :selection-mode="args.selectionMode" :scrollable="args.scrollable" :scrollHeight="args.scrollHeight"
    :striped-rows="args.stripedRows" :style="style" :metaKeySelection="metaKey" removable-sort :editMode="editMode"
    @row-edit-save="onRowEditSave" @row-select="rowSelectionEvent" @row-unselect="rowSelectionEvent"
    @cell-edit-complete="onCellEditComplete" :size="args.size" class="w-full">
    <template #header v-if="args.search">
      <div class="flex justify-end">
        <InputText v-model="filters['global'].value" :placeholder="String(args.searchPlaceholder)" />
      </div>
    </template>

    <Column v-for="col of args.columns" :key="col.field" :field="col.field" :header="col.header"
      :sortable="args.sortable" :frozen="frozenColumns.includes(col.field)" :align-frozen="frozenSide[col.field]">
      <template #body="{ data: rowData, field }">
        <template v-if="col.type.startsWith('list_')">
          <div class="flex flex-wrap gap-1">
            <template v-for="item in rowData[field]" :key="item">
              <Chip :label="String(item)" class="mr-1" />
            </template>
          </div>
        </template>
        <template v-else-if="col.type === 'date' || col.type === 'datetime'">
          {{ rowData[field] === 'YYYY-MM-DD' ? '' : formatDate(rowData[field], args.dateFormat || '%m/%d/%Y') }}
        </template>
        <template v-else>
          {{ rowData[field] }}
        </template>
      </template>

      <template #editor="{ data: rowData, field }">
        <!-- Boolean editor -->
        <template v-if="col.type === 'boolean'">
          <Checkbox v-model="rowData[field]" :binary="true" />
        </template>

        <!-- Date/Datetime editor -->
        <template v-else-if="col.type === 'date' || col.type === 'datetime'">
          <Calendar v-model="dateModelValue[field]" :showTime="col.type === 'datetime'" dateFormat="mm/dd/yy"
            :showIcon="true" @date-select="(date) => handleDateSelect(rowData, field, date)"
            @hide="(date) => handleDateSelect(rowData, field, dateModelValue[field])" />
        </template>

        <!-- List editors with MultiSelect -->
        <template v-else-if="col.type.startsWith('list_')">
          <MultiSelect :ref="'multiSelect_' + field" v-model="rowData[field]" :options="col.distinctValues"
            :placeholder="'Select values'" filter display="chip" :filterValue="multiSelectFilterValue[field]"
            @filter="onMultiSelectFilter($event.value, field)">
            <template #footer>
              <div class="p-3 flex justify-between">
                <Button label="Add new" text size="small" @click="onAddNewListValue(rowData, field)" />
                <Button label="Ok" text size="small" @click="hideMultiSelectOverlay(field)" />
              </div>
            </template>
          </MultiSelect>
        </template>

        <!-- Number/String editors with autocomplete -->
        <template v-else>
          <AutoComplete v-model="rowData[field]" :suggestions="filteredSuggestions[field]" :dropdown="true"
            :forceSelection="false" @complete="(e) => searchSuggestions(field, e.query)"
            @item-select="(e) => handleItemSelect(field, e)" @input="(e) => handleCustomInput(field, e)"
            @keydown.enter.prevent="(e) => handleSimpleColumnEnter(rowData, field, e.target.value)">
            <template #item="slotProps">
              <div>{{ slotProps.item }}</div>
            </template>
          </AutoComplete>
        </template>
      </template>
    </Column>

    <Column v-if="args.rowEditor" :rowEditor="true" style="width: 10%;" bodyStyle="text-align:center" />
  </DataTable>
</template>

<script>
import { useStreamlit } from "./streamlit"
import { Streamlit } from "streamlit-component-lib"
import { ref, reactive, watch, getCurrentInstance } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';
import Calendar from 'primevue/calendar';
import MultiSelect from 'primevue/multiselect';
import AutoComplete from 'primevue/autocomplete';
import Chip from 'primevue/chip';
import Button from 'primevue/button';

export default {
  name: "pDataTable",
  components: {
    DataTable,
    Column,
    InputText,
    Checkbox,
    Calendar,
    MultiSelect,
    AutoComplete,
    Chip,
    Button,
  },
  props: {
    args: {
      data: [],
      pagination: Boolean,
      pageSize: Number,
      columns: {
        field: String,
        header: String,
        type: String,
        distinctValues: Array,
      },
      frozenColumns: Array < String > [],
      frozenRows: Array < Number > [],
      footerRows: Array < Number > [],
      rowEditor: Boolean,
      hasSelectionCallback: Boolean,
      search: Boolean,
      selectionMode: String,
      searchPlaceholder: String,
      sortable: Boolean,
      scrollable: Boolean,
      scrollHeight: String,
      stripedRows: Boolean,
      maxWidth: String,
      dateFormat: String,
      cellEditor: Boolean,
      size: String,
    }
  },

  setup(props) {
    useStreamlit()
    const instance = getCurrentInstance(); // To access $refs in Composition API
    const data = ref(props.args.data)
    const filteredSuggestions = reactive({})
    const newListValues = reactive({})
    const dateModelValue = reactive({})
    const multiSelectFilterValue = reactive({})

    const filters = ref({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });

    const editingRows = ref([]);
    const selectedRows = ref([]);
    const footerRows = ref([]);

    const frozenRows = ref(
      props.args.frozenRows ? props.args.frozenRows : []
    );

    for (let i = 0; i < frozenRows.value.length; i++) {
      frozenRows.value[i] = data.value[frozenRows.value[i]]
    }

    if (props.args.footerRows) {
      for (let i = 0; i < props.args.footerRows.length; i++) {
        footerRows.value.push(data.value[props.args.footerRows[i]])
      }
    }

    watch(editingRows, (newRows) => {
      if (newRows && newRows.length > 0) {
        const row = newRows[0];
        for (const col of props.args.columns) {
          if ((col.type === 'date' || col.type === 'datetime') && row[col.field] && row[col.field] !== 'YYYY-MM-DD') {
            const value = row[col.field];
            let date;
            if (!value.includes('T')) {
              const parts = value.split('-');
              if (parts.length === 3) {
                const [year, month, day] = parts.map(Number);
                date = new Date(year, month - 1, day);
              } else {
                date = new Date(value);
              }
            } else {
              date = new Date(value);
            }
            if (!isNaN(date)) {
              dateModelValue[col.field] = date;
            }
          }
        }
      }
    });

    const formatDate = (value, format) => {
      if (!value || value === 'YYYY-MM-DD') return '';
      let date;
      if (!value.includes('T')) {
        const parts = value.split('-');
        if (parts.length === 3) {
          const [year, month, day] = parts.map(Number);
          date = new Date(year, month - 1, day);
        } else {
          date = new Date(value);
        }
      } else {
        date = new Date(value);
      }

      if (isNaN(date.getTime())) return value;

      const formatMap = {
        '%Y': date.getFullYear(),
        '%m': String(date.getMonth() + 1).padStart(2, '0'),
        '%d': String(date.getDate()).padStart(2, '0'),
        '%H': String(date.getHours()).padStart(2, '0'),
        '%M': String(date.getMinutes()).padStart(2, '0'),
        '%S': String(date.getSeconds()).padStart(2, '0'),
      };

      return format.replace(/%[YmdHMS]/g, match => formatMap[match] || match);
    };

    const handleDateSelect = (rowData, field, date) => {
      if (!date) return;
      const originalValue = rowData[field];
      const isDateOnly = originalValue && !originalValue.includes('T');

      if (date instanceof Date) {
        if (isDateOnly) {
          rowData[field] = date.toISOString().split('T')[0];
        } else {
          rowData[field] = date.toISOString();
        }
      }
    };

    const searchSuggestions = (field, query) => {
      const column = props.args.columns.find(col => col.field === field);
      if (!column || !column.distinctValues) return;
      filteredSuggestions[field] = column.distinctValues.filter(value =>
        String(value).toLowerCase().includes(query.toLowerCase())
      );
    };

    const handleItemSelect = (field, event) => {
      console.log(`Selected ${event.value} for ${field}`);
    };

    const handleCustomInput = (field, event) => {
      console.log(`Custom input ${event.target.value} for ${field}`);
    };

    const addNewListValue = (rowData, field, value) => {
      const column = props.args.columns.find(col => col.field === field);
      if (!column) return;

      if (!column.distinctValues.includes(value)) {
        column.distinctValues.push(value);
      }

      if (!Array.isArray(rowData[field])) {
        rowData[field] = [];
      }

      if (!rowData[field].includes(value)) {
        rowData[field].push(value);
      }
    };

    const onAddNewListValue = (rowData, field) => {
      const value = multiSelectFilterValue[field];
      if (value && value.trim() !== '') {
        addNewListValue(rowData, field, value.trim());
      }
      hideMultiSelectOverlay(field);
    };

    const handleSimpleColumnEnter = (rowData, field, value) => {
      if (!value) return;
      const column = props.args.columns.find(col => col.field === field);
      if (!column) return;
      rowData[field] = value;
      if (!column.distinctValues.includes(value)) {
        column.distinctValues.push(value);
      }
    };

    const onRowEditSave = (event) => {
      let { newData, index } = event;
      data.value[index] = newData;
      Streamlit.setComponentValue(JSON.stringify({
        content: data.value,
        selection: [],
        selectionIndex: 0,
      }));
    };

    const rowSelectionEvent = () => {
      if (props.args.hasSelectionCallback) {
        Streamlit.setComponentValue(JSON.stringify({
          content: data.value,
          selection: selectedRows.value,
        }))
      }
    }

    const style = {
      maxWidth: props.args.maxWidth ? props.args.maxWidth : '100%',
      height: '100%',
      whiteSpace: 'nowrap',
    }

    const frozenColumns = props.args.frozenColumns ? props.args.frozenColumns : []
    const frozenSide = {}
    for (let i = 0; i < frozenColumns.length; i++) {
      if (i === 0) {
        frozenSide[frozenColumns[i]] = 'left'
      } else {
        frozenSide[frozenColumns[i]] = frozenColumns[i - 1] === frozenColumns[i] ? 'left' : 'right'
      }
    }

    const metaKey = props.args.selectionMode === 'multiple'

    const onCellEditComplete = (event) => {
      let { data: row, newValue, field } = event;
      row[field] = newValue;
      Streamlit.setComponentValue(JSON.stringify({
        content: data.value,
        selection: [],
        selectionIndex: 0,
      }));
    };

    const editMode = props.args.cellEditor ? 'cell' : 'row'

    const onMultiSelectFilter = (value, field) => {
      multiSelectFilterValue[field] = value;
    };

    function hideMultiSelectOverlay(field) {
      const multiSelectRef = 'multiSelect_' + field;
      const ms = instance.refs[multiSelectRef];
      if (ms && ms[0] && ms[0].hide) {
        ms[0].hide();
      } else {
        console.warn(`Cannot find MultiSelect ref for field: ${field}`);
      }
    }

    return {
      filters,
      editingRows,
      editMode,
      selectedRows,
      data,
      onRowEditSave,
      rowSelectionEvent,
      style,
      frozenColumns,
      frozenRows,
      frozenSide,
      metaKey,
      filteredSuggestions,
      newListValues,
      dateModelValue,
      searchSuggestions,
      handleItemSelect,
      handleCustomInput,
      addNewListValue,
      formatDate,
      handleDateSelect,
      handleSimpleColumnEnter,
      onCellEditComplete,
      multiSelectFilterValue,
      onMultiSelectFilter,
      onAddNewListValue,
      hideMultiSelectOverlay,
    }
  },
}
</script>

<style>
.p-autocomplete {
  width: 100%;
}

.p-calendar {
  width: 100%;
}

.p-multiselect {
  width: 100%;
}

.p-chip {
  margin: 2px;
}

.flex-wrap {
  flex-wrap: wrap;
}

.gap-1 {
  gap: 0.25rem;
}

.mr-1 {
  margin-right: 0.25rem;
}
</style>
