<template>
  <BaseContianer
    :editor="editor"
    :node="node"
    :deleteNode="deleteNode"
    :getPos="getPos"
    :selected="selected"
  >
    <node-view-content />
  </BaseContianer>
</template>

<script setup>
import { NodeViewContent } from "@tiptap/vue-3";
import BaseContianer from "../BaseContainer.vue";
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
