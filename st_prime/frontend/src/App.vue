<template>
  <div id="app">
    <WithStreamlitConnection v-slot="{ args }">
      <component :is="componentsByName[args.comp]" :args="args"/>
    </WithStreamlitConnection>
  </div>
</template>

<script setup lang="ts">
import PButton from "@/pButton.vue";
import pDataTable from "@/pDataTable.vue";

const componentsByName = {
  "button": PButton,
  "datatable": pDataTable,
}

</script>

<script lang="ts">
import {defineComponent} from "vue"

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
