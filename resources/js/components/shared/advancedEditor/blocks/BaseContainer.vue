<template>
  <node-view-wrapper :as="as" :class="['block-wrapper', isFocused && 'block-wrapper--focused']">
    <CustomControls
      v-if="isEditable"
      @removeNode="removeNode"
      @moveUp="moveUp"
      @moveDown="moveDown"
    />
    <slot name="options" />
    <div class="block-content">
      <slot />
    </div>
  </node-view-wrapper>
</template>

<script setup>
import { NodeViewWrapper } from '@tiptap/vue-3'
import { computed } from 'vue'
import { useElementFocus } from '@/functions/editor/composables/useElementFocus'
import CustomControls from './CustomControls.vue'

const props = defineProps({
  as: { default: 'div' },
  editor: { type: Object },
  node: { type: Object },
  decorations: { type: Array, default: () => [] },
  selected: { type: Boolean, required: false, default: false },
  extension: { type: Object, required: false },
  getPos: { type: Function, required: false },
  updateAttributes: { type: Function, required: false },
  deleteNode: { type: Function, required: true },
})

const { isFocused } = useElementFocus(props)

const isEditable = computed(() => !!props.editor?.isEditable)

function moveUp() {
  props.editor.commands.moveNodeUp()
}

function moveDown() {
  props.editor.commands.moveNodeDown()
}

function removeNode() {
  props.deleteNode()
}
</script>

<style>
.block-wrapper {
  position: relative;
  width: 100%;
  border-left: 2px solid transparent;
  padding-left: 2px;
  transition: border-left-color 0.15s ease;
}

.block-wrapper--focused {
  border-left-color: #bfdbfe;
}

.dark .block-wrapper--focused {
  border-left-color: #3b82f6;
}

.block-content {
  width: 100%;
}
</style>
