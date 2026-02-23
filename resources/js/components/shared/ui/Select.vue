<template>
  <select
    :value="modelValue"
    :disabled="disabled"
    :class="[
      'w-full rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white',
      'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer',
      size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm',
      disabled
        ? 'border-gray-200 dark:border-gray-600 opacity-50 cursor-not-allowed'
        : 'border-gray-200 dark:border-gray-600',
    ]"
    @change="$emit('update:modelValue', $event.target.value)"
  >
    <slot />
  </select>
</template>

<script setup>
defineProps({
  modelValue: { default: '' },
  disabled: { type: Boolean, default: false },
  size: { type: String, default: 'md' }, // 'sm' | 'md'
})
defineEmits(['update:modelValue'])
</script>
