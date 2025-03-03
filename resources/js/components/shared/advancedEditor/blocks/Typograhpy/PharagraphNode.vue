<!-- ParagraphNodeView.vue -->
<template>
  <BaseContianer
    :editor="editor"
    :node="node"
    :deleteNode="deleteNode"
    :getPos="getPos"
    :selected="selected"
  >
    <FwbP>
      <node-view-content />
    </FwbP>

  </BaseContianer>
</template>

<script setup>
import { NodeViewContent } from "@tiptap/vue-3";
import BaseContianer from "../BaseContainer.vue";
import { FwbP } from "flowbite-vue";

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
</script>

<style>
.paragraph-content {
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
  line-height: 1.5;
}
</style>
