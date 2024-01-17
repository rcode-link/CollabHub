<script setup lang="ts">
import { ref, watch } from "vue";
//@ts-ignore
import Editor from "../../../../../shared/Editor.vue";
//@ts-ignore
import EditorHeader from "../../../../../shared/advancedEditor/EditorHeader.vue";

const editorRef = ref<InstanceType<typeof Editor> | null>(null);
const props = defineProps<{
  modelValue: object[];
}>();

const model = ref<object[]>();

watch(
  () => props.modelValue,
  () => {
    editorRef.value?.editor?.commands.setContent(props.modelValue);
  }
);

const emits = defineEmits<{
  (e: "update:modelValue", value: object[]): void;
}>();

watch(model, () => {
  if (model.value) {
    emits("update:modelValue", model.value);
  }
});
</script>
<template>
  <EditorHeader v-if="editorRef" :editor="editorRef.editor" />
  <Editor ref="editorRef" v-model="model" css-class="input big-input" />
</template>