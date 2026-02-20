<script setup>
defineProps({
  variant: { type: String, default: 'primary' }, // primary | ghost | danger | soft
  size:    { type: String, default: 'md' },        // sm | md
  type:    { type: String, default: 'button' },
  disabled:{ type: Boolean, default: false },
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      'inline-flex items-center justify-center gap-1.5 font-medium rounded-lg transition-colors focus:outline-none',
      size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-sm',
      disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
      variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-500',
      variant === 'ghost'   && 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
      variant === 'danger'  && 'bg-red-600 text-white hover:bg-red-500',
      variant === 'soft'    && 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600',
    ]"
  >
    <slot />
  </button>
</template>
