<template>
  <BaseContainer
    :editor="editor"
    :node="node"
    :deleteNode="deleteNode"
    :getPos="getPos"
    :selected="selected"
  >
    <hr class="my-2 border-gray-300 dark:border-gray-600" />
  </BaseContainer>
</template>

<script setup>
import { NodeViewContent } from '@tiptap/vue-3'
import BaseContainer from '@/components/shared/advancedEditor/blocks/BaseContainer.vue'

const props = defineProps({
  editor: { type: Object, required: true },
  node: { type: Object, required: true },
  decorations: { type: Array, required: false, default: () => [] },
  selected: { type: Boolean, required: false, default: false },
  extension: { type: Object, required: true },
  getPos: { type: Function, required: true },
  updateAttributes: { type: Function, required: false },
  deleteNode: { type: Function, required: true },
})
</script>
