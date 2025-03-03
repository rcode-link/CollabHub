<!-- ListItemNodeView.vue -->
<template>
  <node-view-wrapper as="li">
      <node-view-content class="inline-content" />
  </node-view-wrapper>
</template>

<script setup>
import { NodeViewContent, NodeViewWrapper } from "@tiptap/vue-3";

// Props from TipTap
defineProps({
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
.list-item-node {
  margin: 0.25em 0;
  display: flex;
  align-items: flex-start;
}

/* Force paragraph to display inline with the bullet */
.list-item-node > div {
  margin: 0;
  padding: 0;
  display: inline;
}

/* Handle paragraph content inside list items */
.list-item-node p {
  margin: 0;
  padding: 0;
  display: inline;
}
</style>
