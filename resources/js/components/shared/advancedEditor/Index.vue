<script setup lang="js">
import { EditorContent, useEditor } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import { Link } from "@tiptap/extension-link";
import { ref, watch } from "vue";
import { FwbButton } from "flowbite-vue";
import { createLowlight } from "lowlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import FloppyDiskIcon from "../icons/FloppyDiskIcon.vue";
import drawIoExtension from "@rcode-link/tiptap-drawio";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import tableExtension from "../../../functions/editor/TableExtension";
import { useRoute } from "vue-router";
import EditorHeader from "./EditorHeader.vue";
import hljs from "highlight.js";
import MobileMenu from "./MobileMenu.vue";
import Mention from "@tiptap/extension-mention";
import suggestion from "../../../functions/editor/mention/suggestion";
import { SmilieReplacer } from "../../../functions/smilieReplacer";
import { useConvertTextToLink } from "../../../functions/editor/convertTextToLink";
import { Collaboration } from "@/functions/editor/colab/Collaboration";
import { Cursors } from "@/functions/editor/colab/Cursor";
const props = defineProps({
    modelValue: {
        type: String,
    },
    editable: {
        type: Boolean,
    },
});

const lowlight = createLowlight();

hljs.listLanguages().forEach(async (lang) => {
    lowlight.register(lang, hljs.getLanguage(lang).rawDefinition);
});

const route = useRoute();
const emit = defineEmits(["update:modelValue", "submitted"]);

const pressedKeys = ref([]);
const textToLink = useConvertTextToLink();

const submited = async () => {
    emit('update:modelValue', editor.value.getJSON());
    emit("submitted", true);
}

const editor = useEditor({
    content: cleanTiptapJson(props.modelValue),
    editable: props.editable,
    debug: true,
    editorProps: {
        handleDOMEvents: {
            keydown: (view, event) => {
                if (["Control", "Enter"].indexOf(event.key) > -1) {
                    pressedKeys.value.push(event.key);
                }
                if (pressedKeys.value.join("-") === "Control-Enter") {
                    event.preventDefault();
                    submited();
                }
            },
            keyup(view, event) {
                pressedKeys.value = pressedKeys.value.filter(
                    (key) => key !== event.key,
                );
            },
        },
    },
    extensions: [
        StarterKit,
        // Cursors,
        // Collaboration.configure({
        //     documentId: 1
        // }),
        Mention.configure({
            HTMLAttributes: {
                class: "mention",
            },

            suggestion,
        }),
        Link.configure({}),
        CodeBlockLowlight.configure({
            lowlight,
        }),
        drawIoExtension.configure({ openDialog: "dblclick" }),
        tableExtension.configure({
            resizable: true,
            allowTableNodeSelection: true,
        }),
        TableRow,
        TableHeader,
        TableCell,
        SmilieReplacer,
        textToLink.convertTextToLink,
    ],

});

const exportToPDF = () => {
    document.getElementById('print').innerHTML = editor.value.getHTML();
    window.print();
};
function cleanTiptapJson(json) {
    // Recursively clean the content
    function cleanContent(content) {
        return content
            .map((item) => {
                // Remove empty text nodes and null text content
                if (
                    item.type === "text" &&
                    (!item.text || item.text.trim() === "")
                ) {
                    return null;
                }
                if (item.content) {
                    item.content = cleanContent(item.content);
                }
                // Remove elements with empty content arrays
                if (item.content && item.content.length === 0) {
                    return null;
                }
                return item;
            })
            .filter((item) => item !== null); // Remove null items
    }
    try {
        // Clean the top-level content
        json.content = cleanContent(json?.content ?? []);

        return json;
    } catch (e) {
        console.log(e);
        return "";
    }
}
</script>

<template>
  <div
    v-if="editor"
    class="max-w-full pb-2 gap-1 hidden lg:flex"
  >
    <EditorHeader :editor="editor" />
    <div class="ml-auto">
      <fwb-button
        color="alternative"
        @click="exportToPDF"
      >
        Export
      </fwb-button>
      <fwb-button
        color="alternative"
        @click="() => submited()"
      >
        <FloppyDiskIcon class="w-4 h-4" />
      </fwb-button>
    </div>
  </div>
  <MobileMenu
    v-if="editor"
    :editor="editor"
    class="block lg:hidden"
  />
  <editor-content
    class="document-editor"
    :editor="editor"
  />
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
