<template>
  <DataTable
      v-model:filters="filters"
      v-model:editingRows="editingRows"
      v-model:selection="selectedRows"
      :value="data"
      :paginator="Boolean(args.pagination)"
      :rows="args.pageSize"
      :selection-mode="args.selectionMode"
      :scrollable="args.scrollable"
      :scrollHeight="args.scrollHeight"
      :style="style"
      :metaKeySelection="metaKey"
      removable-sort
      editMode="row"
      @row-edit-save="onRowEditSave"
      @row-select="rowSelectionEvent"
      @row-unselect="rowSelectionEvent"
      class="w-full"
  >
    <template #header v-if=args.search>
      <div class="flex justify-end">
        <InputText
            v-model="filters['global'].value"
            :placeholder=String(args.searchPlaceholder)
        />
      </div>
    </template>

    <Column
        v-for="col of args.columns"
        :key="col.field"
        :field="col.field"
        :header="col.header"
        :sortable="args.sortable"
        :frozen="frozenColumns.includes(col.field)"
        :align-frozen="frozenSide[col.field]"
    >
      <template #editor="{ data, field }">
        <InputText v-model="data[field]" autofocus fluid/>
      </template>
    </Column>

    <Column
        :rowEditor="args.rowEditor"
        style="width: 10%;"
        bodyStyle="text-align:center"
    />
  </DataTable>
</template>

<script>
import {useStreamlit} from "./streamlit"
import {Streamlit} from "streamlit-component-lib"

import {ref} from 'vue';
import {FilterMatchMode} from '@primevue/core/api';

export default {
  name: "pDataTable",
  props: {
    args: {
      data: [],
      pagination: Boolean,
      pageSize: Number,
      columns: {
        field: String,
        header: String,
      },
      frozenColumns: Array < String > [],
      rowEditor: Boolean,
      hasSelectionCallback: Boolean,
      search: Boolean,
      selectionMode: String,
      searchPlaceholder: String,
      sortable: Boolean,
      scrollable: Boolean,
      scrollHeight: String,
      maxWidth: String,
    }
  },

  setup(props) {
    useStreamlit()
    const data = ref(props.args.data)

    const filters = ref({
      global: {value: null, matchMode: FilterMatchMode.CONTAINS},
    });

    const editingRows = ref([]);
    const selectedRows = ref([]);

    const onRowEditSave = (event) => {
      let {newData, index} = event;
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

    return {
      filters,
      editingRows,
      selectedRows,
      data,
      onRowEditSave,
      rowSelectionEvent,
      style,
      frozenColumns,
      frozenSide,
      metaKey
    }
  },
}
</script>
