<template>
  <div id="app">
    <WithStreamlitConnection v-slot="{ args }">
      <p-button :args="args" />
      <p-data-table :args="args" />
    </WithStreamlitConnection>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

import WithStreamlitConnection from "./streamlit/WithStreamlitConnection.vue"
import PButton from "@/pButton.vue";
import pDataTable from "@/pDataTable.vue";

export default defineComponent({
  name: "App",
  components: {
    PButton,
    pDataTable,
    WithStreamlitConnection,
  },
})
</script>

<style>
body {
  margin: 0;
}
</style>
