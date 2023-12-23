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
  <input type="checkbox" :value="value" @change="changed"/>
</template>

<style scoped>

</style>
