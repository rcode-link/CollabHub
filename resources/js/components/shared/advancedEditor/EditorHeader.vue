<script setup>
import Modal from '../Modal.vue'
import { FwbTextarea } from 'flowbite-vue'
import TextBold from '../icons/TextBold.vue'
import CodeIcon from '../icons/CodeIcon.vue'
import BulletListIcon from '../icons/BulletListIcon.vue'
import RedoIcon from '../icons/RedoIcon.vue'
import TextStroke from '../icons/TextStroke.vue'
import DiagramIcon from '../icons/DiagramIcon.vue'
import TextItalic from '../icons/TextItalic.vue'
import UndoIcon from '../icons/UndoIcon.vue'
import TableIcon from '../icons/TableIcon.vue'
import QuoteIcon from '../icons/QuoteIcon.vue'
import ToolbarBtn from './toolbar/ToolbarBtn.vue'
import ToolbarSep from './toolbar/ToolbarSep.vue'
import ToolbarDropdown from './toolbar/ToolbarDropdown.vue'
import ToolbarItem from './toolbar/ToolbarItem.vue'
import FilePdfIcon from '../icons/FilePdf.vue'
import { computed, ref } from 'vue'
import axios from 'axios'

const exportToPDF = () => {
  document.getElementById('print').innerHTML = props.editor.getHTML()
  window.print()
}

const props = defineProps({ editor: null })

const markdown = ref('')
const handleInsertMarkdown = () => {
  props.editor.commands.insertContent(markdown.value)
  markdown.value = ''
}

const imageInput = ref(null)
const imageUploading = ref(false)
const addImage = () => imageInput.value?.click()
const handleImageFile = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  const form = new FormData()
  form.append('file', file)
  imageUploading.value = true
  try {
    const { data } = await axios.post('/api/v1/editor/files', form)
    props.editor.chain().focus().setImage({ src: data.url, alt: file.name, title: file.name }).run()
  } finally {
    imageUploading.value = false
    event.target.value = ''
  }
}

const insertTable = () => {
  props.editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  props.editor.commands.addElementAfterTable('paragraph')
}

const textTypes = [
  { label: 'Paragraph', cmd: () => props.editor.chain().focus().setParagraph().run() },
  { label: 'Heading 1',  cmd: () => props.editor.chain().focus().toggleHeading({ level: 1 }).run() },
  { label: 'Heading 2',  cmd: () => props.editor.chain().focus().toggleHeading({ level: 2 }).run() },
  { label: 'Heading 3',  cmd: () => props.editor.chain().focus().toggleHeading({ level: 3 }).run() },
  { label: 'Heading 4',  cmd: () => props.editor.chain().focus().toggleHeading({ level: 4 }).run() },
  { label: 'Heading 5',  cmd: () => props.editor.chain().focus().toggleHeading({ level: 5 }).run() },
]

const activeTextType = computed(() => {
  for (let i = 1; i <= 5; i++) {
    if (props.editor.isActive('heading', { level: i })) return `Heading ${i}`
  }
  return 'Paragraph'
})
</script>

<template>
  <div class="editor-toolbar flex items-center gap-0.5 px-3 py-1.5 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">

    <!-- Text type -->
    <ToolbarDropdown>
      <template #trigger>
        {{ activeTextType }}
        <svg class="w-3 h-3 ml-1 opacity-50" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/>
        </svg>
      </template>
      <ToolbarItem v-for="t in textTypes" :key="t.label" @click="t.cmd()">{{ t.label }}</ToolbarItem>
    </ToolbarDropdown>

    <ToolbarSep />

    <!-- Formatting -->
    <ToolbarBtn :active="editor.isActive('bold')"   title="Bold (Ctrl+B)"    @click="editor.chain().focus().toggleBold().run()"><TextBold class="w-4 h-4"/></ToolbarBtn>
    <ToolbarBtn :active="editor.isActive('italic')" title="Italic (Ctrl+I)"  @click="editor.chain().focus().toggleItalic().run()"><TextItalic class="w-4 h-4"/></ToolbarBtn>
    <ToolbarBtn :active="editor.isActive('strike')" title="Strikethrough"    @click="editor.chain().focus().toggleStrike().run()"><TextStroke class="w-4 h-4"/></ToolbarBtn>
    <ToolbarBtn :active="editor.isActive('codeBlock')" title="Code block"    @click="editor.chain().focus().toggleCodeBlock().run()"><CodeIcon class="w-4 h-4"/></ToolbarBtn>

    <ToolbarSep />

    <!-- Lists & blocks -->
    <ToolbarBtn :active="editor.isActive('bulletList')"  title="Bullet list"    @click="editor.chain().focus().toggleBulletList().run()"><BulletListIcon class="w-4 h-4"/></ToolbarBtn>
    <ToolbarBtn :active="editor.isActive('orderedList')" title="Numbered list"  @click="editor.chain().focus().toggleOrderedList().run()">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
      </svg>
    </ToolbarBtn>
    <ToolbarBtn :active="editor.isActive('blockquote')" title="Quote" @click="editor.chain().focus().toggleBlockquote().run()"><QuoteIcon class="w-4 h-4"/></ToolbarBtn>

    <ToolbarSep />

    <!-- Insert -->
    <ToolbarDropdown>
      <template #trigger>
        <svg class="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
        </svg>
        Insert
      </template>
      <template #default="{ close }">
        <ToolbarItem :disabled="imageUploading" @click="close(); addImage()">
          <DiagramIcon class="w-4 h-4 opacity-50"/>
          {{ imageUploading ? 'Uploading…' : 'Image' }}
        </ToolbarItem>
        <ToolbarItem @click="close(); insertTable()">
          <TableIcon class="w-4 h-4 opacity-50"/>
          Table
        </ToolbarItem>
        <ToolbarItem @click="close(); editor.commands.insertDrawIo()">
          <DiagramIcon class="w-4 h-4 opacity-50"/>
          Diagram
        </ToolbarItem>
        <ToolbarItem @click="close(); editor.chain().focus().setHorizontalRule().run()">
          <svg class="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 12h16"/>
          </svg>
          Divider
        </ToolbarItem>
      </template>
    </ToolbarDropdown>

    <input ref="imageInput" type="file" accept="image/*" class="hidden" @change="handleImageFile" />

    <!-- Markdown import -->
    <Modal>
      <template #button>
        <button class="tb-pill" title="Import Markdown">
          <svg class="w-3.5 h-3.5 mr-1 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          MD
        </button>
      </template>
      <template #header>Import Markdown</template>
      <template #body><fwb-textarea label="Paste markdown" v-model="markdown" /></template>
      <template #footer><button class="tb-pill" @click="handleInsertMarkdown">Insert</button></template>
    </Modal>

    <!-- Undo / Redo / PDF -->
    <div class="ml-auto flex items-center gap-0.5">
      <ToolbarSep />
      <ToolbarBtn title="Undo (Ctrl+Z)" :disabled="!editor.can().chain().focus().undo().run()" @click="editor.chain().focus().undo().run()"><RedoIcon class="w-4 h-4"/></ToolbarBtn>
      <ToolbarBtn title="Redo (Ctrl+Y)" :disabled="!editor.can().chain().focus().redo().run()" @click="editor.chain().focus().redo().run()"><UndoIcon class="w-4 h-4"/></ToolbarBtn>
      <ToolbarSep />
      <ToolbarBtn title="Export to PDF" @click="exportToPDF"><FilePdfIcon class="w-4 h-4"/></ToolbarBtn>
    </div>
  </div>
</template>

<style scoped>
.editor-toolbar {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
</style>
