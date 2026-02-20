<script setup>

const props = defineProps({
  value: {}
})

const emits = defineEmits(['update'])

const changed = (e) => {
  emits("update", {
    val: props.value,
    checked: e.target.checked
  });
}
</script>

<template>
  <input
    type="checkbox"
    :value="value"
    @change="changed"
    class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
  />
</template>

<style scoped></style>
