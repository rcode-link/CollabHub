<!-- BulletListNodeView.vue -->
<template>
  <BaseContianer
    :editor="editor"
    :node="node"
    :deleteNode="deleteNode"
    :getPos="getPos"
    :selected="selected"
  >
        <ul  class="max-w-md space-y-1 text-gray-500 list-disc list-inside dark:text-gray-400">
     <node-view-content />
        </ul>
  </BaseContianer>
</template>

<script setup>
import { computed } from "vue";
import { NodeViewContent } from "@tiptap/vue-3";
import BaseContianer from "../BaseContainer.vue";

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

// Get list type from attributes if available, default to "disc"
const listType = computed(() => {
  const type = props.node.attrs.listType || "disc";
  return type;
});
</script>
