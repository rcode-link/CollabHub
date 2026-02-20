<script setup>
import { FwbButton } from 'flowbite-vue'

defineProps({
    color: { type: String, default: 'default' },
    size: { type: String, default: 'md' },
    outline: { type: Boolean, default: false },
    type: { type: String, default: 'button' },
    disabled: { type: Boolean, default: false },
})
</script>

<template>
    <FwbButton
        :color="color"
        :size="size"
        :outline="outline"
        :type="type"
        :disabled="disabled"
    >
        <slot></slot>
    </FwbButton>
</template>

<style scoped></style>
