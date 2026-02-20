<script setup>
defineProps({
  active: { type: Boolean, default: false },
  title: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['click'])
</script>

<template>
  <button
    :title="title"
    :disabled="disabled"
    :class="[
      'tb-btn',
      active && 'tb-btn--active',
      disabled && 'tb-btn--disabled',
    ]"
    @click="emit('click')"
  >
    <slot />
  </button>
</template>

<style>
.tb-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 5px;
  color: #6b7280;
  transition: background 0.1s, color 0.1s;
  flex-shrink: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
}
.tb-btn:hover:not(:disabled) {
  background: #f3f4f6;
  color: #111827;
}
.dark .tb-btn { color: #9ca3af; }
.dark .tb-btn:hover:not(:disabled) { background: #374151; color: #f9fafb; }
.tb-btn--active { background: #eff6ff; color: #2563eb; }
.dark .tb-btn--active { background: #1e3a8a; color: #93c5fd; }
.tb-btn--disabled, .tb-btn:disabled { opacity: 0.3; cursor: not-allowed; }
</style>
