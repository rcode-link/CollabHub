<template>
  <node-view-wrapper
    :as="as"
    :class="['block-wrapper', isFocused && isEditable && 'block-wrapper--focused']"
  >
    <input
      ref="imageInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleImageFile"
    />
    <slot name="options" :isFocused="isFocused && isEditable" />
    <div class="block-content">
      <slot />
    </div>
    <div v-if="isFocused && isEditable" class="item-options">
      <CustomControls
        v-if="isEditable"
        @removeNode="removeNode"
        @moveUp="moveUp"
        @moveDown="moveDown"
      />
      <div>
        <ToolbarItem
          :disabled="imageUploading"
          @click="insertParagraphAfter"
        >
          <svg
            class="w-4 h-4"
            viewBox="0 0 32 32"
            fill="currentColor"
            width="32"
            height="32"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
          >
            <path
              d="M25 12h-5v2h5a1.0008 1.0008 0 0 1 1 1v2h-4a3.0033 3.0033 0 0 0-3 3v1a3.0033 3.0033 0 0 0 3 3h6v-9a3.0033 3.0033 0 0 0-3-3zM22 22a1.0008 1.0008 0 0 1-1-1v-1a1.0008 1.0008 0 0 1 1-1h4v3z"
            />
            <path
              d="M16 24h2L12 7h-2L4 24h2l1.6936-5h6.6135zM8.3711 17l2.4966-7.3711 0.2668 5e-4L13.63 17z"
            />
          </svg>
        </ToolbarItem>

        <ToolbarItem :disabled="imageUploading" @click="addImage()">
          <svg
            class="w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15"
            />
          </svg>
        </ToolbarItem>
        <ToolbarItem @click="insertTable()">
          <TableIcon class="w-4 h-4" />
        </ToolbarItem>
        <ToolbarItem @click="editor.commands.insertDrawIo()">
          <DiagramIcon class="w-4 h-4" />
        </ToolbarItem>

        <!-- Markdown import -->
        <Modal>
          <template #button>
            <button class="tb-pill" title="Import Markdown">
              <svg
                class="w-4 h-4"
                viewBox="0 0 16 16"
                fill="currentColor"
                fill-rule="evenodd"
              >
                <path
                  d="M14 3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"
                  fill-rule="nonzero"
                />
                <path
                  d="M9.146 8.146a0.5 0.5 0 0 1 0.708 0L11.5 9.793l1.646-1.647a0.5 0.5 0 0 1 0.708 0.708l-2 2a0.5 0.5 0 0 1-0.708 0l-2-2a0.5 0.5 0 0 1 0-0.708"
                />
                <path
                  d="M11.5 5A0.5 0.5 0 0 1 12 5.5v4a0.5 0.5 0 0 1-1 0v-4A0.5 0.5 0 0 1 11.5 5"
                />
                <path
                  d="M3.56 11V7.01h0.056l1.428 3.239h0.774l1.42-3.24h0.056V11h1.073V5.001h-1.2l-1.71 3.894H5.418l-1.71-3.894H2.5V11z"
                  fill-rule="nonzero"
                />
              </svg>
            </button>
          </template>
          <template #header>Import Markdown</template>
          <template #body
            ><fwb-textarea label="Paste markdown" v-model="markdown"
          /></template>
          <template #footer
            ><button class="tb-pill" @click="handleInsertMarkdown">
              Insert
            </button></template
          >
        </Modal>

        <ToolbarItem @click="editor.chain().focus().setHorizontalRule().run()">
          <svg
            class="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 12h16" />
          </svg>
        </ToolbarItem>
      </div>
    </div>
  </node-view-wrapper>
</template>

<script setup>
import { NodeViewWrapper } from '@tiptap/vue-3'
import { FwbTextarea } from 'flowbite-vue'

import Modal from '@/components/shared/Modal.vue'

import ToolbarItem from '@/components/shared/advancedEditor/toolbar/ToolbarBtn.vue'
import { computed, ref } from 'vue'
import { useElementFocus } from '@/functions/editor/composables/useElementFocus'
import CustomControls from '@/components/shared/advancedEditor/blocks/CustomControls.vue'
import TextBold from '@/components/shared/icons/TextBold.vue'
import CodeIcon from '@/components/shared/icons/CodeIcon.vue'
import BulletListIcon from '@/components/shared/icons/BulletListIcon.vue'
import RedoIcon from '@/components/shared/icons/RedoIcon.vue'
import TextStroke from '@/components/shared/icons/TextStroke.vue'
import DiagramIcon from '@/components/shared/icons/DiagramIcon.vue'
import TextItalic from '@/components/shared/icons/TextItalic.vue'
import UndoIcon from '@/components/shared/icons/UndoIcon.vue'
import TableIcon from '@/components/shared/icons/TableIcon.vue'
import QuoteIcon from '@/components/shared/icons/QuoteIcon.vue'

const props = defineProps({
  as: { default: 'div' },
  editor: { type: Object },
  node: { type: Object },
  decorations: { type: Array, default: () => [] },
  selected: { type: Boolean, required: false, default: false },
  extension: { type: Object, required: false },
  getPos: { type: Function, required: false },
  updateAttributes: { type: Function, required: false },
  deleteNode: { type: Function, required: true },
})

const { isFocused } = useElementFocus(props)

const isEditable = computed(() => !!props.editor?.isEditable)

const markdown = ref('')
const handleInsertMarkdown = () => {
  props.editor.commands.insertContent(markdown.value)
  markdown.value = ''
}

const imageInput = ref(null)
const imageUploading = ref(false)
const addImage = () => imageInput.value?.click()
const handleImageFile = async event => {
  const file = event.target.files?.[0]
  if (!file) return
  const form = new FormData()
  form.append('file', file)
  imageUploading.value = true
  try {
    const { data } = await axios.post('/api/v1/editor/files', form)
    const insertPos = props.getPos() + props.node.nodeSize
    props.editor
      .chain()
      .insertContentAt(insertPos, {
        type: 'resizableImage',
        attrs: { src: data.url, alt: file.name, title: file.name },
      })
      .focus(insertPos + 1)
      .run()
  } catch (err) {
    console.error('Image upload failed:', err)
    alert('Image upload failed. Please try again.')
  } finally {
    imageUploading.value = false
    event.target.value = ''
  }
}

const insertTable = () => {
  props.editor
    .chain()
    .focus()
    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
    .run()
  props.editor.commands.addElementAfterTable('paragraph')
}

function moveUp() {
  props.editor.commands.moveNodeUp()
}

function moveDown() {
  props.editor.commands.moveNodeDown()
}

function removeNode() {
  props.deleteNode()
}

function insertParagraphAfter() {
  const insertPos = props.getPos() + props.node.nodeSize
  props.editor
    .chain()
    .insertContentAt(insertPos, { type: 'paragraph' })
    .focus(insertPos + 1)
    .run()
}
</script>

<style>
.block-wrapper {
  position: relative;
  width: 100%;
  border-left: 2px solid transparent;
  padding-left: 2px;
  transition: border-left-color 0.15s ease;
}

.block-controls {
  opacity: 0;
  pointer-events: none;
}

.block-wrapper--focused .block-controls {
  opacity: 1;
  pointer-events: all;
}
.block-wrapper--focused {
  border-left-color: #bfdbfe;
}

.dark .block-wrapper--focused {
  border-left-color: #3b82f6;
}

.block-content {
  width: 100%;
}
.item-options {
  display: flex;
  justify-content: space-between;
}
</style>
