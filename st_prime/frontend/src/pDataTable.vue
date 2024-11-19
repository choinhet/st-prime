<template>
  <DataTable
      v-model:filters="filters"
      v-model:editingRows="editingRows"
      :value="data"
      paginator :rows="10"
      dataKey="id"
      filterDisplay="row"
      editMode="row"
      @row-edit-save="onRowEditSave"
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
      columns: {
        field: String,
        header: String,
      },
      search: Boolean,
      searchPlaceholder: String,
    }
  },

  setup(props) {
    useStreamlit()

    const data = props.args.data

    const filters = ref({
      global: {value: null, matchMode: FilterMatchMode.CONTAINS},
    });

    const editingRows = ref([]);

    const onRowEditSave = (event) => {
      let {newData, index} = event;
      data[index] = newData;
      Streamlit.setComponentValue(JSON.stringify(data))
    };

    return {
      filters,
      editingRows,
      onRowEditSave,
      data,
    }
  },
}
</script>
