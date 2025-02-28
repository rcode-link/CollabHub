<script setup lang="js">
import { EditorContent, useEditor } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import { Link } from "@tiptap/extension-link";
import { ref, watch, computed } from "vue";
import { FwbButton, FwbCard } from "flowbite-vue";
import { createLowlight } from "lowlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import FloppyDiskIcon from "../icons/FloppyDiskIcon.vue";
import FilePdfIcon from "../icons/FilePdf.vue";
import drawIoExtension from "@rcode-link/tiptap-drawio";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import tableExtension from "../../../functions/editor/TableExtension";
import Navitaion from "../../../functions/editor/editorNavigation.js";
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
import Placeholder from "@tiptap/extension-placeholder";
import AdvancedBlockInsertionMenu from "../../../functions/editor/AdvancedBlockInsertionMenu";
import BlockHoverActions from "../../../functions/editor/BlockHoverActions";
import EnsureParagraph from "../../../functions/editor/EnsureParagraph";
import EditorNavigation from "../../../functions/editor/EditorNavigation";

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


const showExtensions = computed(() => {
    return props.editable;
});

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
        AdvancedBlockInsertionMenu,
        EditorNavigation,
        BlockHoverActions,

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
            handleWidth: 5,
            cellMinWidth: 50,
            lastColumnResizable: true,
        }),
        TableRow,
        TableHeader,
        TableCell,
        SmilieReplacer,
        textToLink.convertTextToLink,
    ],
});

const exportToPDF = () => {
    console.log(editor.value);
    document.getElementById('print').innerHTML = editor.value.getHTML();
    window.print();
};

function cleanTiptapJson(rawData) {
    const json = { ...rawData };
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
  <div class="w-full bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
    <fwb-card-header
      class="p-0 border-b-0"
      v-if="editor"
    >
      <!-- Desktop toolbar -->
      <div class="hidden lg:block">
        <EditorHeader :editor="editor" />
      </div>

      <!-- Mobile toolbar -->
      <MobileMenu
        v-if="editor"
        :editor="editor"
        class="block lg:hidden"
      />
    </fwb-card-header>

    <editor-content
      class="editor-content mb-4 sm:mb-0"
      :editor="editor"
    />

    <fwb-card-footer class="justify-end gap-2 bg-gray-50 dark:bg-gray-800 p-2 hidden md:flex">
      <fwb-button
        color="light"
        size="sm"
        @click="exportToPDF"
      >

        <div class="flex flex-col justify-center items-center">

          <FilePdfIcon class="w-4 h-4" />
        </div>
      </fwb-button>
      <fwb-button
        size="sm"
        @click="submited"
      >
        <div class="flex flex-col justify-center items-center">
          <FloppyDiskIcon class="w-4 h-4" />
        </div>
      </fwb-button>
    </fwb-card-footer>
  </div>
</template>

<style>
.editor-content {
  @apply w-full p-3 bg-white dark:bg-gray-800;
  height: calc(100vh - 150px);
  overflow-y: auto;
}

.editor-content > .tiptap.ProseMirror {
  @apply min-h-full w-full active:border-none focus:border-none focus:outline-0;
}

.editor-content > .tiptap.ProseMirror-focused {
  outline: none;
  border: none;
}

/* Mention styling */
.mention {
  @apply bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1 rounded;
}

.selected-table-cell {
  background-color: rgba(59, 130, 246, 0.1) !important;
}

.selected-table-row {
  background-color: rgba(59, 130, 246, 0.05) !important;
}

.tiptap-table {
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;
  margin: 0;
  overflow: hidden;
}

/* Basic editor styles */
.tiptap :first-child {
  margin-top: 0;
}


.tiptap table .selectedCell:after {
  background: var(--gray-2);
  content: "";
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  pointer-events: none;
  position: absolute;
  z-index: 2;
}

.tiptap table .column-resize-handle {
  background-color: var(--purple);
  bottom: -2px;
  pointer-events: none;
  position: absolute;
  right: -2px;
  top: 0;
  width: 4px;
}

.tiptap .tableWrapper {
  margin: 1.5rem 0;
  overflow-x: auto;
}

/* Added styling for our improved table plugin */
.tiptap.resize-cursor {
  cursor: ew-resize;
  cursor: col-resize;
}

.tiptap .selected-table-row {
  background-color: rgba(0, 100, 255, 0.05);
}

.tiptap .selected-table-cell {
  position: relative;
}

.tiptap .selected-table-cell::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 100, 255, 0.1);
  pointer-events: none;
  z-index: 2;
}
</style>
