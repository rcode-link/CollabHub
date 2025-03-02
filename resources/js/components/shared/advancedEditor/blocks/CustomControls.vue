<template>
  <fwb-button-group>
    <FwbButton
      outline
            size="sm"
      @click.stop="() => emits('moveUp')"
      title="Move Up"
      data-drag-handle
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="16"
        height="16"
      >
        <path
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          d="m18 15-6-6-6 6"
        />
      </svg>
    </FwbButton>

    <FwbButton
      @click.stop="() => emits('moveDown')"
      title="Move Down"
      outline
            size="sm"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="16"
        height="16"
      >
        <path
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          d="m6 9 6 6 6-6"
        />
      </svg>
    </FwbButton>

    <FwbButton
      outline
      color="red"
      @click.stop="() => emits('removeNode')"
      title="Delete"
            size="sm"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="16"
        height="16"
      >
        <path
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 5v6m4-6v6"
        />
      </svg>
    </FwbButton>
  </fwb-button-group>
</template>
<script setup>
const emits = defineEmits(["removeNode", "moveUp", "moveDown"]);
import { FwbButtonGroup, FwbButton } from "flowbite-vue";
</script>
