<template>
    <Button @click="onClicked">{{ args.name }}</Button>
</template>

<script>
import { ref } from "vue"
import { Streamlit } from "streamlit-component-lib"
import { useStreamlit } from "./streamlit"

export default {
  name: "pButton",
  props: ["args"],
  setup() {
    useStreamlit()

    const numClicks = ref(0)
    const onClicked = () => {
      numClicks.value++
      Streamlit.setComponentValue(numClicks.value)
    }

    return {
      numClicks,
      onClicked,
    }
  },
}
</script>
