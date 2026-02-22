<script setup lang="js">
import { ref, watch } from "vue";
import Editor from "../../../../../shared/Editor.vue";
import { toast } from "vue3-toastify";

const editorRef = ref(null);
const props = defineProps(['modelValue']);

const model = ref();

watch(
    () => [props.modelValue, editorRef.value?.editor],
    () => { editorRef.value?.editor?.commands.setContent(props.modelValue); },
    { immediate: true }
);

const emits = defineEmits(['update:modelValue', 'update:markdown']);

watch(model, () => {
    if (model.value) {
        emits("update:modelValue", model.value);
        if (editorRef.value?.editor?.storage?.markdown) {
            emits("update:markdown", editorRef.value.editor.storage.markdown.getMarkdown());
        }
    }
}, { deep: true });

const isActive = (type, attrs) => editorRef.value?.editor?.isActive(type, attrs);
const run = (fn) => fn(editorRef.value?.editor?.chain().focus());

const toolbarBtn = (active) =>
    active
        ? 'p-1.5 rounded text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700'
        : 'p-1.5 rounded text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors';

// File / image upload
const fileInputRef = ref(null);
const uploading = ref(false);

const uploadFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    uploading.value = true;

    try {
        const { data } = await window.axios.post('/api/v1/editor/files', formData);
        const editor = editorRef.value?.editor;
        if (!editor) return;

        if (data.image) {
            editor.chain().focus().setImage({ src: data.url, alt: data.name, title: data.name }).run();
        } else {
            // Insert a download link for non-image files
            editor.chain().focus()
                .insertContent(`<a href="${data.url}" target="_blank" rel="noopener">${data.name}</a>`)
                .run();
        }
    } catch {
        toast.error('File upload failed. Please try again.');
    } finally {
        uploading.value = false;
        event.target.value = '';
    }
};
</script>

<template>
    <!-- Toolbar -->
    <div class="flex items-center gap-0.5 flex-wrap border-b border-gray-100 dark:border-gray-700 pb-1.5 mb-2">
        <!-- Heading -->
        <button type="button" :class="toolbarBtn(isActive('heading', { level: 1 }))" title="Heading 1"
            @click="run(c => c.toggleHeading({ level: 1 }).run())">
            <span class="text-xs font-bold leading-none px-0.5">H1</span>
        </button>
        <button type="button" :class="toolbarBtn(isActive('heading', { level: 2 }))" title="Heading 2"
            @click="run(c => c.toggleHeading({ level: 2 }).run())">
            <span class="text-xs font-bold leading-none px-0.5">H2</span>
        </button>
        <button type="button" :class="toolbarBtn(isActive('heading', { level: 3 }))" title="Heading 3"
            @click="run(c => c.toggleHeading({ level: 3 }).run())">
            <span class="text-xs font-bold leading-none px-0.5">H3</span>
        </button>

        <div class="w-px h-4 bg-gray-200 dark:bg-gray-600 mx-0.5 flex-shrink-0" />

        <!-- Inline -->
        <button type="button" :class="toolbarBtn(isActive('bold'))" title="Bold (Ctrl+B)"
            @click="run(c => c.toggleBold().run())">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>
        </button>
        <button type="button" :class="toolbarBtn(isActive('italic'))" title="Italic (Ctrl+I)"
            @click="run(c => c.toggleItalic().run())">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
        </button>
        <button type="button" :class="toolbarBtn(isActive('strike'))" title="Strikethrough"
            @click="run(c => c.toggleStrike().run())">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.3 4.9c-2.3-.6-4.4-1-6.2-.9-2.7 0-5.3.7-5.3 3.6 0 1.5 1.8 3.3 2.1 3.9h1.7m2.1 3.5h-6.6m11.8 0h2.2m-9.2 4.2c2.5.6 5 1.1 7.4.1 1.4-.7 2.3-1.9 2.3-3.4 0-1.7-1.3-3-3.4-3.8"/></svg>
        </button>
        <button type="button" :class="toolbarBtn(isActive('code'))" title="Inline code"
            @click="run(c => c.toggleCode().run())">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        </button>

        <div class="w-px h-4 bg-gray-200 dark:bg-gray-600 mx-0.5 flex-shrink-0" />

        <!-- Lists -->
        <button type="button" :class="toolbarBtn(isActive('bulletList'))" title="Bullet list"
            @click="run(c => c.toggleBulletList().run())">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1" fill="currentColor" stroke="none"/></svg>
        </button>
        <button type="button" :class="toolbarBtn(isActive('orderedList'))" title="Numbered list"
            @click="run(c => c.toggleOrderedList().run())">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
        </button>
        <button type="button" :class="toolbarBtn(isActive('blockquote'))" title="Blockquote"
            @click="run(c => c.toggleBlockquote().run())">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
        </button>
        <button type="button" :class="toolbarBtn(isActive('codeBlock'))" title="Code block"
            @click="run(c => c.toggleCodeBlock().run())">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><line x1="2" y1="20" x2="22" y2="20"/></svg>
        </button>

        <div class="w-px h-4 bg-gray-200 dark:bg-gray-600 mx-0.5 flex-shrink-0" />

        <!-- File / image upload -->
        <button
            type="button"
            :class="toolbarBtn(false)"
            :title="uploading ? 'Uploading…' : 'Attach image or file'"
            :disabled="uploading"
            @click="fileInputRef?.click()"
        >
            <svg v-if="!uploading" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
            <svg v-else class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
        </button>
        <input ref="fileInputRef" type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip" class="hidden" @change="uploadFile" />

        <slot name="header" />
    </div>

    <Editor ref="editorRef" v-model="model" css-class="doc-editor" placeholder="Add a description…" />
</template>
