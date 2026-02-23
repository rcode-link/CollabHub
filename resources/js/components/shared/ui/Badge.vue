<template>
  <span
    :class="[
      'inline-flex items-center gap-1 font-medium rounded-full',
      sizeClasses,
      colorClasses,
    ]"
  >
    <slot />
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  color: {
    type: String,
    default: 'gray',
    // 'gray' | 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange'
  },
  size: {
    type: String,
    default: 'sm',
    // 'xs' | 'sm'
  },
})

const sizeClasses = computed(() =>
  props.size === 'xs' ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
)

const colorClasses = computed(() => ({
  gray:   'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
  blue:   'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  green:  'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  red:    'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  yellow: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  orange: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
})[props.color] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300')
</script>
