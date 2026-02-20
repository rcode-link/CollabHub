<script setup>
defineProps({
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['click'])
</script>

<template>
  <button
    :disabled="disabled"
    class="tb-item"
    @click="emit('click')"
  >
    <slot />
  </button>
</template>

<style>
.tb-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 5px;
  font-size: 0.8rem;
  color: #374151;
  text-align: left;
  width: 100%;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.1s;
}
.tb-item:hover:not(:disabled) { background: #f3f4f6; }
.dark .tb-item { color: #d1d5db; }
.dark .tb-item:hover:not(:disabled) { background: #374151; }
.tb-item:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
