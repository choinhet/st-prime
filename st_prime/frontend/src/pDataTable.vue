<template>
  <DataTable
      v-model:filters="filters"
      v-model:editingRows="editingRows"
      v-model:selection="selectedRows"
      :value="data"
      :paginator="Boolean(args.pagination)"
      :rows="args.pageSize"
      :selection-mode="args.selectionMode"
      :metaKeySelection="true"
      removable-sort
      filterDisplay="row"
      editMode="row"
      @row-edit-save="onRowEditSave"
      @row-select="rowSelectionEvent"
      @row-unselect="rowSelectionEvent"
      class="w-fit"
  >
    <template #header v-if=args.search>
      <div class="flex justify-end">
        <InputText
            v-model="filters['global'].value"
            :placeholder=String(args.searchPlaceholder)
        />
      </div>
    </template>

    <template #empty> No data found.</template>

    <Column
        v-for="col of args.columns"
        :key="col.field"
        :field="col.field"
        :header="col.header"
        :sortable="args.sortable"
    >
      <template #editor="{ data, field }">
        <InputText v-model="data[field]" autofocus fluid/>
      </template>
    </Column>

    <Column
        :rowEditor="args.rowEditor"
        style="width: 10%; min-width: 8rem"
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
      rowEditor: Boolean,
      search: Boolean,
      selectionMode: String,
      searchPlaceholder: String,
      sortable: Boolean,
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
      Streamlit.setComponentValue(JSON.stringify({
        content: data.value,
        selection: selectedRows.value,
      }))
    }

    return {
      filters,
      editingRows,
      selectedRows,
      data,
      onRowEditSave,
      rowSelectionEvent,
    }
  },
}
</script>
