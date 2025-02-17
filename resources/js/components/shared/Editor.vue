<script setup>
import { EditorContent, useEditor } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import { Link } from "@tiptap/extension-link";
import { ref, computed } from "vue";
import { createLowlight } from "lowlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import drawIoExtension from "@rcode-link/tiptap-drawio";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import tableExtension from "../../functions/editor/TableExtension";
import hljs from "highlight.js";
import Mention from "@tiptap/extension-mention";
import useSuggestion from "../../functions/editor/mention/suggestion";
import { SmilieReplacer } from "../../functions/smilieReplacer";
import { useConvertTextToLink } from "../../functions/editor/convertTextToLink";
import { chatDetails } from "../../store/chatStore";
import vacation from "../shared/vacationPlugin/vacation";
import { Markdown } from "tiptap-markdown";
const chatStore = chatDetails();
const props = defineProps({
    modelValue: "",
    model: "",
    cssClass: "",
    editable: true,
});

const pressedKeys = ref([]);
const textToLink = useConvertTextToLink();
const emit = defineEmits(["update:modelValue", "submitted"]);

const lowlight = createLowlight();

hljs.listLanguages().forEach(async (lang) => {
    //@ts-ignore
    lowlight.register(lang, hljs.getLanguage(lang).rawDefinition);
});

const suggestion = useSuggestion();

const editor = useEditor({
    content: props.model ?? props.modelValue,
    editable: props.editable,
    editorProps: {
        handleDOMEvents: {
            keydown: (view, event) => {
                if (["Control", "Enter"].indexOf(event.key) > -1) {
                    pressedKeys.value.push(event.key);
                }
                if (pressedKeys.value.join("-") === "Control-Enter") {
                    event.preventDefault();
                    emit("submitted", true);
                }
            },
            keyup(view, event) {
                pressedKeys.value = pressedKeys.value.filter(
                    (key) => key !== event.key,
                );
            },
        },
        handlePaste: function (view, event, slice) {
            const items = Array.from(event.clipboardData?.items || []).filter(
                (obj) => obj.kind === "file",
            );
            chatStore.addFiles(items.map((obj) => obj.getAsFile()));
        },
    },
    extensions: [
        StarterKit,
        Mention.configure({
            HTMLAttributes: {
                class: "mention",
                onclick:
                    "window.open(`/user/${event.target.getAttribute('data-id')}`)",
            },
            suggestion: suggestion.plugin,
        }),
        Link.configure({}),
        CodeBlockLowlight.configure({
            lowlight,
        }),
        vacation,
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
        Markdown,
    ],
    onUpdate() {
        emit("update:modelValue", editor.value?.getJSON());
    },
});

defineExpose({
    editor,
});
</script>

<template>
    <editor-content :editor="editor" :class="props.cssClass" />
</template>

<style scoped></style>
