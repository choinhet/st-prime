<template>
    <DataTable v-model:filters="filters"  v-model:editingRows="editingRows" :value="customers" paginator :rows="10" dataKey="id" filterDisplay="row" :loading="loading" :globalFilterFields="['name', 'age']" editMode="row"  @row-edit-save="onRowEditSave"
            :pt="{
                table: { style: 'min-width: 50rem' },
                column: {
                    bodycell: ({ state }) => ({
                        style:  state['d_editing']&&'padding-top: 0.75rem; padding-bottom: 0.75rem'
                    })
                }
            }"
               class = "w-fit"
    >
      <template #header>
        <div class="flex justify-end">
          <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
        </div>
      </template>
      <template #empty> No data found. </template>
      <template #loading> Loading data. Please wait. </template>

      <Column field="name" header="Name" style="min-width: 12rem">
        <template #body="slotProps">
          {{ slotProps.data.name }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" type="text" @input="filterCallback()" placeholder="Search by name" />
        </template>
        <template #editor="{ data, field }">
          <Select v-model="data[field]" editable :options="names" optionLabel="label" optionValue="value" placeholder="Select a name" fluid>
            <template #option="slotProps">
              {{ slotProps.option.label }}
            </template>
          </Select>
        </template>
      </Column>

      <Column field="age" header="Age" style="min-width: 12rem">
        <template #body="{ data }">
          {{ data.age }}
        </template>
        <template #editor="{ data, field }">
          <InputText v-model="data[field]" fluid />
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" type="text" @input="filterCallback()" placeholder="Search by age" />
        </template>
      </Column>

      <Column :rowEditor="true" style="width: 10%; min-width: 8rem" bodyStyle="text-align:center"></Column>
    </DataTable>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';

const customers = ref();
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  age: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
});

const editingRows = ref([]);

const loading = ref(true);

const names = ref([
  { label: 'Rafael', value: 'Rafael' },
  { label: 'Juvenal', value: 'Juvenal' },
  { label: 'Ribamar', value: 'Ribamar' }
]);

const onRowEditSave = (event) => {
  let { newData, index } = event;

  customers.value[index] = newData;
};

onMounted(() => {
  customers.value = [
    {
      name: "Rafael",
      age: "27",
    },
    {
      name: "Juvenal",
      age: "35"
    },
    {
      name: "Ribamar",
      age: "15"
    },
  ]
  loading.value = false;
});

</script>
<script>
import { ref } from "vue"
import { useStreamlit } from "./streamlit"

export default {
  name: "pDataTable",
  props: ["args"],
  setup() {
    useStreamlit()
    return {}
  },
}
</script>
