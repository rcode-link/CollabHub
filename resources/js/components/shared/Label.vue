<script setup>
import { useErrorsStore } from "../../store/errors";
const errors = useErrorsStore();
defineProps({
  forInput: "",
});
</script>

<template>
  <label
    :for="forInput"
    :class="{
      'block mb-2 text-sm font-medium text-gray-900 dark:text-white':
        !errors.errors.hasOwnProperty(forInput),
      'block mb-2 text-sm font-medium text-red-700 dark:text-red-500':
        errors.errors.hasOwnProperty(forInput),
    }"
  >
    <slot></slot>
  </label>
</template>

<style scoped>
</style>
