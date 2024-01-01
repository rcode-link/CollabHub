<script setup lang="ts">

import {EditorContent, useEditor} from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import {Link} from "@tiptap/extension-link";
import {defineEmits, ref} from "vue";
import {FwbButton} from "flowbite-vue";
import {createLowlight} from 'lowlight'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import FloppyDiskIcon from "../icons/FloppyDiskIcon.vue";
import drawIoExtension from '@rcode-link/tiptap-drawio'
import {TableRow} from "@tiptap/extension-table-row";
import {TableHeader} from "@tiptap/extension-table-header";
import {TableCell} from "@tiptap/extension-table-cell";
import tableExtension from "../../../functions/editor/TableExtension.js";
import {useRoute} from "vue-router";
import EditorHeader from "./EditorHeader.vue";
import hljs from 'highlight.js';
import MobileMenu from "./MobileMenu.vue";
import Mention from "@tiptap/extension-mention";
import suggestion from "../../../functions/editor/mention/suggestion";
import {SmilieReplacer} from "../../../functions/smilieReplacer";
import {useConvertTextToLink} from "../../../functions/editor/convertTextToLink";


const props = withDefaults(defineProps<{
  modelValue: string,
  editable: boolean,
}>(), {
  editable: true
});

const lowlight = createLowlight()

hljs.listLanguages().forEach(async (lang) => {
lowlight.register(lang, hljs.getLanguage(lang).rawDefinition);
})

const route = useRoute();
const emit = defineEmits(['update:modelValue', 'submitted'])

const pressedKeys = ref([]);
const textToLink = useConvertTextToLink();

const editor = useEditor({
  content: props.modelValue,
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
      Mention.configure({
          HTMLAttributes: {
              class: 'mention',
          },
          suggestion,
      }),
    Link.configure({}),
    CodeBlockLowlight.configure({
      lowlight,
    }),
    drawIoExtension.configure({openDialog: 'dblclick'}),
    tableExtension.configure({
      resizable: true,
      allowTableNodeSelection: true
    }),
    TableRow,
    TableHeader,
      TableCell,
      SmilieReplacer,
      textToLink.convertTextToLink

  ],
  onUpdate() {
    emit('update:modelValue', editor.value.getJSON())
  }
});
</script>

<template>
    <div v-if="editor" class="max-w-full pb-2 gap-1 hidden lg:flex">
        <EditorHeader :editor="editor"/>
    <div class="ml-auto">
      <fwb-button
          color="alternative"
          @click="() => emit('submitted', true)"
      >
        <FloppyDiskIcon class="w-4 h-4"/>
      </fwb-button>
    </div>
  </div>
    <MobileMenu v-if="editor" :editor="editor" class="block lg:hidden"/>
  <editor-content class="document-editor" :editor="editor"/>
</template>

<style>
.document-editor {
  @apply w-full flex p-1 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700;
  height: calc(100vh - 50px);
  margin-bottom: 10px;
  overflow: auto;
}

.document-editor > .tiptap.ProseMirror {
  @apply min-h-[80vh] w-full active:border-none focus:border-none focus:outline-0;
}

.document-editor > .tiptap.ProseMirror-focused {
  outline: none;
  border: none;
}

</style>
