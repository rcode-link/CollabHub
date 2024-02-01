<script lang="ts" setup>
withDefaults(defineProps<{ color: string | null }>(), {
    color: null,
});
</script>

<template>
    <div
        :class="`flex p-6 border border-gray-200 rounded-lg shadow dark:border-gray-700 ${
            color ?? 'bg-white dark:bg-gray-800'
        }`"
    >
        <slot></slot>
    </div>
</template>
