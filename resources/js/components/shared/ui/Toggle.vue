<template>
  <label class="flex items-center gap-2 cursor-pointer select-none">
    <div class="relative flex-shrink-0">
      <input
        type="checkbox"
        class="sr-only"
        :checked="modelValue"
        :disabled="disabled"
        @change="$emit('update:modelValue', $event.target.checked)"
      />
      <div
        class="w-8 h-4 rounded-full transition-colors"
        :class="modelValue ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'"
      />
      <div
        class="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform"
        :class="modelValue ? 'translate-x-4' : 'translate-x-0'"
      />
    </div>
    <span v-if="$slots.default" class="text-xs text-gray-600 dark:text-gray-300">
      <slot />
    </span>
  </label>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})
defineEmits(['update:modelValue'])
</script>
