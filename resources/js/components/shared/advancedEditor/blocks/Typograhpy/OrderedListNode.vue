<!-- OrderedListNodeView.vue -->
<template>
  <BaseContainer
    :editor="editor"
    :node="node"
    :deleteNode="deleteNode"
    :getPos="getPos"
    :selected="selected"
  >
    <ol class="max-w-md space-y-1 text-gray-500 list-inside dark:text-gray-400" :style="{ listStyleType: listType }">
      <node-view-content />
    </ol>
  </BaseContainer>
</template>
<script setup>
import { computed } from 'vue'
import { NodeViewContent } from '@tiptap/vue-3'
import BaseContainer from "../BaseContainer.vue";
// Props from TipTap
const props = defineProps({
    editor: {
        type: Object,
        required: true,
    },
    node: {
        type: Object,
        required: true,
    },
    decorations: {
        type: Array,
        required: false,
        default: () => [],
    },
    selected: {
        type: Boolean,
        required: false,
        default: false,
    },
    extension: {
        type: Object,
        required: true,
    },
    getPos: {
        type: Function,
        required: true,
    },
    updateAttributes: {
        type: Function,
        required: true,
    },
    deleteNode: {
        type: Function,
        required: true,
    },
});
// Get list type from attributes if available, default to "decimal"
const listType = computed(() => {
  const type = props.node.attrs.listType || 'decimal'
  return type
})
</script>
