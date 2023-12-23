<script setup>
import {EditorContent, useEditor} from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import {Link} from "@tiptap/extension-link";
import {ref} from "vue";
import {SmilieReplacer} from "../../functions/smilieReplacer.js";
import {useConvertTextToLink} from "../../functions/editor/convertTextToLink.js";

const emit = defineEmits(['update:modelValue', 'submitted'])

const props = defineProps({
  modelValue: '',
  model: '',
  editable: true,
  cssClass: ''
});



const pressedKeys = ref([]);
const textToLink = useConvertTextToLink();


const editor = useEditor({
  content: props.model ?? props.modelValue,
  editable: props.editable,
  editorProps: {
    handleDOMEvents: {
      keydown: (view, event) => {
        if (['Control', 'Enter'].indexOf(event.key) > -1) {
          pressedKeys.value.push(event.key);
        }
        if (pressedKeys.value.join('-') === 'Control-Enter') {
          event.preventDefault();
          emit('submitted', true);
        }
      },
      keyup(view, event) {
        pressedKeys.value = pressedKeys.value.filter((key) => key !== event.key);
      }
    },
  },
  extensions: [
    StarterKit,
    Link.configure({}),
    SmilieReplacer,
    textToLink.convertTextToLink
  ],
  onUpdate() {
    emit('update:modelValue', editor.value.getJSON())
  }
})

defineExpose({
  editor
})

</script>

<template>
  <editor-content :editor="editor" :class="props.cssClass"/>
</template>

<style scoped>

</style>
