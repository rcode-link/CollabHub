<template>
  <div class="table-node-wrapper" :class="{ 'table-selected': isTableSelected }">
    <BaseContainer
      :editor="editor"
      :node="node"
      :deleteNode="deleteNode"
      :getPos="getPos"
      :selected="selected"
    >
      <TableToolbar
        :editor="editor"
        :node="node"
        :isStriped="node.attrs.striped"
        :selected="isTableSelected"
      >
        <node-view-content />
      </TableToolbar>
    </BaseContainer>
  </div>
</template>

<script setup>
import { NodeViewContent } from "@tiptap/vue-3";
import BaseContainer from "../BaseContainer.vue";
import TableToolbar from "./TableToolbar.vue";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

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

// Track if table is selected or if cursor is inside table
const isTableSelected = computed(() => {
  if (!props.editor || !props.editor.state) return false;

  const { selection } = props.editor.state;
  if (!selection) return false;

  // Check if the node is selected directly
  if (props.selected) return true;

  // Check if cursor is inside this table
  try {
    const tablePos = props.getPos();
    const $pos = selection.$anchor;

    // Check ancestors to see if cursor is inside this table
    for (let i = $pos.depth; i > 0; i--) {
      const node = $pos.node(i);
      const nodePos = $pos.before(i);

      if (node.type.name === 'table' && nodePos === tablePos) {
        return true;
      }
    }
  } catch (e) {
    console.error('Error checking table selection:', e);
  }

  return false;
});

// Update selection status when editor selection changes
const updateHandler = () => {
  // This will trigger the reactivity of the computed property
  // when the editor selection changes
};

// Register and clean up event handler
onMounted(() => {
  if (props.editor && props.editor.on) {
    props.editor.on('selectionUpdate', updateHandler);
  }
});

onUnmounted(() => {
  if (props.editor && props.editor.off) {
    props.editor.off('selectionUpdate', updateHandler);
  }
});
</script>

<style>
.table-node-wrapper {
  position: relative;
  margin: 1rem 0;
  transition: all 0.2s ease-in-out;
}

.table-selected {
  outline: 2px solid rgb(59, 130, 246);
  border-radius: 4px;
}
</style>
