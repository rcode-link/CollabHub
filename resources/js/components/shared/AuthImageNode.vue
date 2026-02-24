<script setup>
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'
import AuthImage from '@/components/shared/AuthImage.vue'

defineProps(nodeViewProps)
</script>

<template>
    <node-view-wrapper as="div" class="auth-image-node" :class="{ 'ProseMirror-selectednode': selected }">
        <AuthImage
            :src="node.attrs.src"
            :alt="node.attrs.alt || ''"
            :title="node.attrs.title"
            class="rounded max-w-full h-auto"
            draggable="true"
            data-drag-handle
        />
    </node-view-wrapper>
</template>
