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
import { useTextToLinkStore } from "@/store/textToLinkStore";
import { LinkPreviewExtension } from "@/functions/editor/LinkPreviewExtension.js";
import { useRouter } from "vue-router";
const chatStore = chatDetails();
const router = useRouter();
const props = defineProps({
    modelValue: "",
    model: "",
    cssClass: "",
    defaultShowPreview: true,
    editable: true,
});

const pressedKeys = ref([]);

const textToLinkStore = useTextToLinkStore();
const textToLink = useConvertTextToLink(textToLinkStore.items, router.push);
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

                    emit("update:modelValue", editor.value?.getJSON());
                    emit("submitted", true);
                }
            },
            keyup(view, event) {
                pressedKeys.value = pressedKeys.value.filter(
                    (key) => key !== event.key
                );
            },
            blur(view, event) {
                // Update the model value when focus leaves the editor
                emit("update:modelValue", editor.value?.getJSON());
            }
        },
        handlePaste: function (view, event, slice) {
            const items = Array.from(event.clipboardData?.items || []).filter(
                (obj) => obj.kind === "file"
            );
            chatStore.addFiles(items.map((obj) => obj.getAsFile()));
        },
    },
    extensions: [
        StarterKit,
        Mention.configure({
            HTMLAttributes: {
                class: "mention",
            },
            suggestion: suggestion.plugin,
        }),
        Link.configure({}),
        LinkPreviewExtension.configure({
            defaultShowPreview: props.editable !== true, // Links start with previews disabled

            // Replace the fetchMetadata function to use our Laravel backend
            fetchMetadata: async (url) => {
                const data = await window.axios
                    .post("/api/v1/link-preview", { url })
                    .then((res) => res.data);
                console.log(data);

                return {
                    url: data.url,
                    title: data.title || url,
                    description: data.description || "",
                    image: data.image || null,
                };
            },
        }),
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
    onUpdate: ({ editor }) => {
        _.debounce(() => emit("update:modelValue", editor.value?.getJSON()), 300);
        // Only emit on blur or when the form is submitted, not on every change
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
