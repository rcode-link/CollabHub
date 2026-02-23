<template>
  <BaseContianer
    :editor="editor"
    :node="node"
    :deleteNode="deleteNode"
    :getPos="getPos"
    :selected="selected"
  >
    <template #options="{ isFocused }">
      <TextToolbar :editor="editor" :node="node" :isFocused="isFocused" />
    </template>

    <fwb-heading
      :tag="`h${level}`"
      :color="headingColor"
      class="heading-content"
    >
      <node-view-content />
    </fwb-heading>
  </BaseContianer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/vue-3'
import { FwbHeading } from 'flowbite-vue'
import BaseContianer from "@/components/shared/advancedEditor/blocks/BaseContainer.vue";
import TextToolbar from "@/components/shared/advancedEditor/blocks/TextToolbar.vue";

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

// State
const showControls = ref(false)
// Computed
const level = computed(() => props.node.attrs.level || 1)
</script>
