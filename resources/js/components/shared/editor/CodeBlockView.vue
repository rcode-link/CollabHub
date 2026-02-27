<script setup>
import { ref, computed } from 'vue'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/vue-3'
import CopyIcon from '@/components/shared/icons/CopyIcon.vue'
import CheckIcon from '@/components/shared/icons/CheckIcon.vue'

const props = defineProps({
    node: Object,
    updateAttributes: Function,
    extension: Object,
    editor: Object,
})

const copied = ref(false)
const wrapperRef = ref(null)

const language = computed(() => props.node.attrs.language || '')

function copyCode() {
    const el = wrapperRef.value?.$el?.querySelector('code') ?? wrapperRef.value?.querySelector('code')
    const text = el ? el.textContent : ''
    navigator.clipboard.writeText(text).then(() => {
        copied.value = true
        setTimeout(() => { copied.value = false }, 2000)
    })
}
</script>

<template>
    <NodeViewWrapper
        ref="wrapperRef"
        as="pre"
        :data-language="language"
    >
        <button
            type="button"
            class="code-copy-btn"
            :class="{ copied }"
            @click="copyCode"
            contenteditable="false"
        >
            <CheckIcon v-if="copied" class="w-3.5 h-3.5" />
            <CopyIcon v-else class="w-3.5 h-3.5" />
            <span>{{ copied ? 'Copied!' : 'Copy' }}</span>
        </button>

        <NodeViewContent as="code" :class="language ? `language-${language}` : ''" />
    </NodeViewWrapper>
</template>
