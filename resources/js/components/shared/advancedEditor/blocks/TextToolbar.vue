<template>
  <div v-if="isFocused" class="table-controls" title="Block formatting">
    <!-- Type group: only for paragraph/heading nodes -->
    <div v-if="showTypeGroup" class="ctrl-group">
      <button
        :class="['ctrl-btn ctrl-btn-text', editor.isActive('paragraph') && 'ctrl-btn-active']"
        title="Paragraph"
        @mousedown.prevent="editor.chain().focus().setParagraph().run()"
      >P</button>
      <button
        :class="['ctrl-btn ctrl-btn-text', editor.isActive('heading', { level: 1 }) && 'ctrl-btn-active']"
        title="Heading 1"
        @mousedown.prevent="editor.chain().focus().setHeading({ level: 1 }).run()"
      >H1</button>
      <button
        :class="['ctrl-btn ctrl-btn-text', editor.isActive('heading', { level: 2 }) && 'ctrl-btn-active']"
        title="Heading 2"
        @mousedown.prevent="editor.chain().focus().setHeading({ level: 2 }).run()"
      >H2</button>
      <button
        :class="['ctrl-btn ctrl-btn-text', editor.isActive('heading', { level: 3 }) && 'ctrl-btn-active']"
        title="Heading 3"
        @mousedown.prevent="editor.chain().focus().setHeading({ level: 3 }).run()"
      >H3</button>
    </div>

    <div v-if="showTypeGroup" class="ctrl-sep" />

    <!-- Format group -->
    <div class="ctrl-group">
      <button
        :class="['ctrl-btn', editor.isActive('bold') && 'ctrl-btn-active']"
        title="Bold"
        @mousedown.prevent="editor.chain().focus().toggleBold().run()"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" stroke-width="0">
          <path d="M6 4h8a4 4 0 0 1 0 8H6V4zm0 8h9a4 4 0 0 1 0 8H6v-8z"/>
        </svg>
      </button>
      <button
        :class="['ctrl-btn', editor.isActive('italic') && 'ctrl-btn-active']"
        title="Italic"
        @mousedown.prevent="editor.chain().focus().toggleItalic().run()"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 4h-9M14 20H5M14.7 4.7L9.2 19.3"/>
        </svg>
      </button>
      <button
        :class="['ctrl-btn', editor.isActive('strike') && 'ctrl-btn-active']"
        title="Strikethrough"
        @mousedown.prevent="editor.chain().focus().toggleStrike().run()"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 4H9a3 3 0 0 0-2.83 4M14 12a4 4 0 0 1 0 8H6M4 12h16"/>
        </svg>
      </button>
    </div>

    <div class="ctrl-sep" />

    <!-- Link -->
    <div class="ctrl-group">
      <button
        :class="['ctrl-btn', editor.isActive('link') && 'ctrl-btn-active']"
        title="Link"
        @mousedown.prevent="setLink"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
      </button>
    </div>

    <!-- Comment (only when comment mark is available) -->
    <template v-if="hasCommentMark">
      <div class="ctrl-sep" />
      <div class="ctrl-group">
        <button
          v-if="!editor.isActive('comment')"
          class="ctrl-btn"
          title="Add comment"
          @mousedown.prevent="emitCommentEvent('editor:add-comment')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            <path d="M12 8v4M10 10h4"/>
          </svg>
        </button>
        <button
          v-else
          class="ctrl-btn"
          title="Remove comment"
          @mousedown.prevent="emitCommentEvent('editor:remove-comment')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            <path d="M9 10h6"/>
          </svg>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  editor: { type: Object, required: true },
  node: { type: Object, required: true },
  isFocused: { type: Boolean, default: false },
})
const emit = defineEmits(['add-comment', 'remove-comment'])

const emitCommentEvent = (type) => {
  // Dispatch a custom DOM event that bubbles up to the AdvancedEditor
  props.editor.view.dom.dispatchEvent(new CustomEvent(type, { bubbles: true }))
}

const hasCommentMark = computed(() => {
  if (!props.editor) return false
  try {
    return !!props.editor.schema.marks.comment
  } catch { return false }
})

const showTypeGroup = computed(() => {
  const name = props.node.type.name
  return name === 'paragraph' || name === 'heading'
})

const setLink = () => {
  const previousUrl = props.editor.getAttributes('link').href
  const url = window.prompt('URL', previousUrl ?? '')
  if (url === null) return
  if (url === '') {
    props.editor.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  props.editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}
</script>

<style scoped>
.table-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  margin-bottom: 2px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  flex-wrap: wrap;
}

:global(.dark) .table-controls {
  background: #111827;
  border-color: #374151;
}

.ctrl-group {
  display: flex;
  align-items: center;
  gap: 2px;
}

.ctrl-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 4px;
  color: #6b7280;
  transition: background 0.1s, color 0.1s;
  flex-shrink: 0;
}
.ctrl-btn svg {
  width: 14px;
  height: 14px;
}
.ctrl-btn:hover {
  background: #e5e7eb;
  color: #111827;
}
:global(.dark) .ctrl-btn {
  color: #9ca3af;
}
:global(.dark) .ctrl-btn:hover {
  background: #374151;
  color: #f9fafb;
}
.ctrl-btn-text {
  width: auto;
  padding: 0 8px;
  font-size: 0.75rem;
  font-weight: 500;
}
.ctrl-btn-active {
  background: #eff6ff;
  color: #2563eb;
}
:global(.dark) .ctrl-btn-active {
  background: #1e3a8a;
  color: #93c5fd;
}

.ctrl-sep {
  width: 1px;
  height: 16px;
  background: #e5e7eb;
  margin: 0 2px;
  flex-shrink: 0;
}
:global(.dark) .ctrl-sep {
  background: #374151;
}
</style>
