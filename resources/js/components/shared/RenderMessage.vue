<script setup>
import { computed } from 'vue'
import { generateHTML } from '@tiptap/core'
import { renderExtensions } from '@/functions/editor/renderExtensions'

const props = defineProps({
    content: { type: [Object, String], default: null },
})

const html = computed(() => {
    if (!props.content) return ''
    try {
        const json = typeof props.content === 'string'
            ? JSON.parse(props.content)
            : props.content
        if (!json?.type) return ''
        return generateHTML(json, renderExtensions)
    } catch {
        return ''
    }
})
</script>

<template>
    <div class="ProseMirror" v-html="html" />
</template>
