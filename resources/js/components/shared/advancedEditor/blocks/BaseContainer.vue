<template>
  <node-view-wrapper :class="{ 'wrapper': true, 'custom-block-wrapper': isFocused }">
    <CustomControls
      v-if="isFocused"
      @removeNode="removeNode"
      @moveUp="moveUp"
      @moveDown="moveDown"
    />
    <div class="custom-block-content">
      <slot />
    </div>
  </node-view-wrapper>
</template>

<script setup>
import { NodeViewWrapper, NodeViewContent } from "@tiptap/vue-3";
import { computed } from "vue";
import { useElementFocus } from "../useElementFocus";
import CustomControls from "./CustomControls.vue";

const props = defineProps({
  editor: {
    type: Object,
  },
  node: {
    type: Object,
  },
  decorations: {
    type: Array,
    default: () => [],
  },
  selected: {
    type: Boolean,
    required: false,
    default: false,
  },
  extension: {
    type: Object,
    required: false,
  },
  getPos: {
    type: Function,
    required: false,
  },
  updateAttributes: {
    type: Function,
    required: false,
  },
  deleteNode: {
    type: Function,
    required: true,
  },
});

// Use our focus tracking composable - just one line!
const { isFocused } = useElementFocus(props);

console.log(props.editor?.state.selection.$anchor.depth);
// Computed properties using the focus state
const nodeType = computed(() => props.node.type.name);

const wrapperClasses = computed(() => [
  "block-wrapper",
  `${nodeType.value}-wrapper`,
  {
    "is-selected": props.selected,
    "is-focused": isFocused.value,
  },
]);
// Your existing methods
function moveUp() {
  // Implementation
  props.editor.commands.moveNodeUp();
}

function moveDown() {
  // Implementation
  props.editor.commands.moveNodeDown();
}

function removeNode() {
  props.deleteNode();
}

// Method that uses focus state
function doSomethingWhenFocused() {
  if (!isFocused) {
    console.log("Not focused, ignoring action");
    return;
  }

  console.log("Node is focused, performing action!");
  // Do your focus-dependent logic here
}
</script>
<style>
.custom-block-wrapper {
  position: relative;
  @apply p-4 gap-3 dark:bg-gray-800 rounded-lg text-gray-800 bg-gray-50 border-gray-500 dark:text-gray-400;
}

.wrapper {
  transition: all 0.2s ease-in;
}
</style>
