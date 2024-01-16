<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useErrorsStore } from "../../store/errors";

const errors = useErrorsStore();
defineProps({
  modelValue: "",
  name: "",
  form: "",
  disabled: false,
});

defineEmits(["update:modelValue"]);

const input = ref(null);

onMounted(() => {
  if (input.value?.hasAttribute("autofocus")) {
    input.value?.focus();
  }
});

defineExpose({ focus: () => input.value?.focus() });
</script>

<template>
  <input
    :class="{
      'w-full': true,
      'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500':
        !errors.errors.hasOwnProperty(name),
      'bg-red-50 border border-red-500 text-red-900 placeholder-red-700 text-sm rounded-lg focus:ring-red-500 dark:bg-gray-700 focus:border-red-500 block w-full p-2.5 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500':
        errors.errors.hasOwnProperty(name),
    }"
    :value="modelValue"
    :id="name"
    :disabled="disabled"
    @input="$emit('update:modelValue', $event.target.value)"
    ref="input"
  />
</template>
