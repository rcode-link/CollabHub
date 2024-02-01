<script setup lang="ts">
import { ref, watch } from "vue";

import Editor from "../../../../../shared/Editor.vue";
import TextBold from "../../../../../shared/icons/TextBold.vue";
import TextItalic from "../../../../../shared/icons/TextItalic.vue";
import TextStroke from "../../../../../shared/icons/TextStroke.vue";
import BulletListIcon from "../../../../../shared/icons/BulletListIcon.vue";
import OrderedListIcon from "../../../../../shared/icons/OrderedListIcon.vue";
import { FwbButton } from "flowbite-vue";

const editorRef = ref<InstanceType<typeof Editor> | null>(null);
const props = defineProps<{
  modelValue: object[] | string;
}>();

const model = ref<object[] | string>();

watch(
  () => [props.modelValue, editorRef.value?.editor],
  () => {
    editorRef.value?.editor?.commands.setContent(props.modelValue);
  },
  {
    immediate: true,
  }
);

const emits = defineEmits<{
  (e: "update:modelValue", value: object[] | string): void;
  (e: "update:markdown", value: object[]): void;
}>();

watch(model, () => {
  if (model.value) {
    emits("update:modelValue", model.value);
    emits(
      "update:markdown",
      editorRef.value?.editor?.storage.markdown.getMarkdown()
    );
  }
});
</script>
<template>
  <fwb-button
    :color="editorRef?.editor?.isActive('bold') ? 'dark' : 'alternative'"
    @click="editorRef?.editor?.chain().focus().toggleBold().run()"
  >
    <TextBold class="w-4 h-4" />
  </fwb-button>
  <fwb-button
    :color="editorRef?.editor?.isActive('italic') ? 'dark' : 'alternative'"
    @click="editorRef?.editor?.chain().focus().toggleItalic().run()"
  >
    <TextItalic class="w-4 h-4" />
  </fwb-button>
  <fwb-button
    :color="editorRef?.editor?.isActive('strike') ? 'dark' : 'alternative'"
    @click="editorRef?.editor?.chain().focus().toggleStrike().run()"
  >
    <TextStroke class="w-4 h-4" />
  </fwb-button>
  <fwb-button
    :color="editorRef?.editor?.isActive('strike') ? 'dark' : 'alternative'"
    @click="editorRef?.editor?.chain().focus().toggleBulletList().run()"
  >
    <BulletListIcon class="w-4 h-4 mr-3" />
  </fwb-button>
  <fwb-button
    :color="editorRef?.editor?.isActive('strike') ? 'dark' : 'alternative'"
    @click="editorRef?.editor?.chain().focus().toggleOrderedList().run()"
  >
    <OrderedListIcon class="w-4 h-4 mr-3" />
  </fwb-button>

  <Editor ref="editorRef" v-model="model" css-class="input big-input" />
</template>