<script setup>
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { Markdown } from 'tiptap-markdown'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import { NodeSelection, TextSelection, Plugin } from '@tiptap/pm/state'
import { ReplaceStep } from '@tiptap/pm/transform'
import { Link } from '@tiptap/extension-link'
import { ref, watch, computed, toRaw } from 'vue'
import { createLowlight } from 'lowlight'
import { EnhancedCodeBlock } from '@/functions/editor/EnhancedCodeBlock'
import drawIoExtension from '@rcode-link/tiptap-drawio'
import { useRoute } from 'vue-router'
import EditorHeader from '@/components/shared/advancedEditor/EditorHeader.vue'
import DrawIONodeView from '@/components/shared/advancedEditor/blocks/drawio/DrawIONodeView.vue'
import hljs from 'highlight.js'
import MobileMenu from '@/components/shared/advancedEditor/MobileMenu.vue'
import Mention from '@tiptap/extension-mention'
import suggestion from '@/functions/editor/mention/suggestion'
import { SmilieReplacer } from '@/functions/smilieReplacer'
import { useConvertTextToLink } from '@/functions/editor/convertTextToLink'
import { Image } from '@tiptap/extension-image'

// Import individual extensions instead of StarterKit
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Heading from '@tiptap/extension-heading'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Strike from '@tiptap/extension-strike'
import Blockquote from '@tiptap/extension-blockquote'
import HardBreak from '@tiptap/extension-hard-break'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import History from '@tiptap/extension-history'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import StripedTable from '@/functions/editor/blocks/table/StripedTableExtension.js'
import CustomBlockView from '@/components/shared/advancedEditor/blocks/customNode/CustomNodeView.vue'
import HeadingBlockView from '@/components/shared/advancedEditor/blocks/Typograhpy/HeadingNode.vue'
import ParagraphNodeView from '@/components/shared/advancedEditor/blocks/Typograhpy/PharagraphNode.vue'
import BulletListNodeView from '@/components/shared/advancedEditor/blocks/Typograhpy/BulletListNode.vue'
import OrderedListNodeView from '@/components/shared/advancedEditor/blocks/Typograhpy/OrderedListNode.vue'
import ListItemNodeView from '@/components/shared/advancedEditor/blocks/Typograhpy/ListItemNode.vue'
import HorizontalRuleNodeView from '@/components/shared/advancedEditor/blocks/Typograhpy/HorizontalRuleNode.vue'
import TableNodeView from '@/components/shared/advancedEditor/blocks/table/TableNodeView.vue'

import Placeholder from '@tiptap/extension-placeholder'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'

import { CommentMark } from '@/functions/editor/marks/CommentMark.js'
import { MoveNode } from '@/functions/editor/extensions/MoveBlock.js'
import { Extension } from '@tiptap/core'
import CustomImage from '@/functions/editor/blocks/imageNode/ImageNode.js'
import { useTextToLinkStore } from '@/store/textToLinkStore'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const props = defineProps({
  modelValue: {
    type: [String, Object],
    default: null,
  },
  editable: {
    type: Boolean,
  },
  documentId: {
    type: [String, Number],
    default: null,
  },
  collaborative: {
    type: Boolean,
    default: false,
  },
  ydoc: {
    type: null, // Y.Doc — use null type to avoid Vue reactivity wrapping
    default: null,
  },
  provider: {
    type: null, // HocuspocusProvider — use null type to avoid Vue reactivity wrapping
    default: null,
  },
  notion: {
    type: Boolean,
    default: false,
  },
})

const textToLinkStore = useTextToLinkStore()
const userStore = useUserStore()
const lowlight = createLowlight()
const router = useRouter()

hljs.listLanguages().forEach(async lang => {
  lowlight.register(lang, hljs.getLanguage(lang).rawDefinition)
})

const route = useRoute()
const emit = defineEmits(['update:modelValue', 'submitted', 'ready', 'add-comment', 'remove-comment'])

const pressedKeys = ref([])
const textToLink = useConvertTextToLink(textToLinkStore.items, router.push)

const submited = async () => {
  emit('update:modelValue', editor.value.getJSON())
  emit('submitted', true)
}

// Helper function for custom node view renderer with optional depth check
const customRenderData = (data, viewComponent) => {
  const { getPos } = data

  // Determine if this node is at depth 1
  if (typeof getPos === 'function') {
    try {
      const pos = getPos()
      // Resolve position to get the actual node context
      const $pos = data.editor?.view.state.doc.resolve(pos)

      if ($pos) {
        // Only use custom view for paragraphs at depth 1
        if ($pos.depth !== 0) {
          return null
        }
      }
    } catch (e) {
      // In case of any error, don't break the editor
      console.error('Error determining node depth:', e)
      return null
    }
  }

  // Return custom view only for depth 1 nodes
  return VueNodeViewRenderer(viewComponent)(data)
}

// Create custom extensions with node views for block elements
const CustomParagraph = Paragraph.extend({
  addNodeView() {
    return data => customRenderData(data, ParagraphNodeView)
  },
  addAttributes() {
    return {
      ...this.parent?.(),
      id: {
        default: () => `paragraph-${Math.floor(Math.random() * 10000)}`,
      },
    }
  },
})

const CustomHeading = Heading.extend({
  addNodeView() {
    return data => customRenderData(data, HeadingBlockView)
  },
  addAttributes() {
    return {
      ...this.parent?.(),
      // Add id attribute to help with finding nodes in the DOM
      id: {
        default: null,
        parseHTML: element =>
          element.getAttribute('id') ||
          `heading-${Math.floor(Math.random() * 10000)}`,
        renderHTML: attributes => {
          return { id: attributes.id }
        },
      },
    }
  },
})

const listClasses = ''

const CustomBulletList = BulletList.extend({
  addNodeView() {
    return data => customRenderData(data, BulletListNodeView)
  },
})

const CustomHorizontalRule = HorizontalRule.extend({
  addNodeView() {
    return data => customRenderData(data, HorizontalRuleNodeView)
  },
})

const CustomOrderedList = OrderedList.extend({
  addNodeView() {
    return data => customRenderData(data, CustomBlockView)
  },
  renderHTML({ HTMLAttributes }) {
    // This creates a direct <ol> without wrapper divs
    return [
      'ol',
      {
        ...HTMLAttributes,
        class: `${HTMLAttributes.class || ''} ${listClasses}`.trim(),
      },
      0,
    ]
  },
  parseHTML() {
    return [{ tag: 'ol' }]
  },
})

const CustomBlockquote = Blockquote.extend({
  addNodeView() {
    return data => customRenderData(data, CustomBlockView)
  },
})
// Extend the Table *node* with the custom node view.
// StripedTable is an Extension (not a Node), so its addNodeView() is ignored by TipTap.
// We must attach the node view to the actual Table node.
const CustomTable = Table.extend({
  addNodeView() {
    return props => VueNodeViewRenderer(TableNodeView)(props)
  },
})

const generateId = prefix => `${prefix}-${Math.floor(Math.random() * 10000)}`
// Define function to get extensions
const getExtensions = () => {
  // Base extensions that are always included
  const extensions = [
    // Core extensions (no custom node views)
    Document,
    Text,
    // Extensions with custom node views
    CustomParagraph,
    CustomHeading,
    CustomBulletList,
    CustomOrderedList,
    CustomBlockquote,
    ListItem.extend({
      renderHTML({ HTMLAttributes }) {
        return [
          'li',
          {
            ...HTMLAttributes,
            class: 'text-gray-500 dark:text-gray-400 ml-6',
          },
          0,
        ]
      },
      parseHTML() {
        return [
          {
            tag: 'li',
          },
        ]
      },
    }),
    Bold,
    Italic,
    Strike,
    CommentMark,
    HardBreak,
    CustomHorizontalRule,
    ...(props.collaborative && props.ydoc ? [] : [History]),
    CustomImage.configure({
      inline: false,
      allowBase64: true,
    }),
    drawIoExtension.extend({
      addNodeView() {
        return props => VueNodeViewRenderer(DrawIONodeView)(props)
      },
      addAttributes() {
        return {
          ...this.parent?.(),
          size: { default: '100' },
          position: { default: 'center' },
          drawioXml: { default: null },
        }
      },
    }).configure({
      openDialog: 'dblclick',
    }),
    Mention.configure({
      HTMLAttributes: {
        class: 'mention',
      },
      suggestion,
    }),
    Link.configure({}),
    EnhancedCodeBlock.configure({
      lowlight,
    }),
    SmilieReplacer,
    textToLink.convertTextToLink,
    CustomTable,
    TableRow,
    TableCell,
    TableHeader,
    StripedTable,
    Placeholder.configure({
      placeholder: 'Write something …',
    }),
    MoveNode,
    Markdown,
    ...(props.collaborative && props.ydoc
      ? [
          Collaboration.configure({ document: toRaw(props.ydoc) }),
          ...(props.provider
            ? [
                CollaborationCursor.configure({
                  provider: toRaw(props.provider),
                  user: {
                    name: userStore.user?.name || 'Unknown',
                    avatar: userStore.user?.avatar || null,
                    color: userStore.user?.id ? getUserColor(userStore.user.id) : '#6B7280',
                  },
                  render: (user) => {
                    const cursor = document.createElement('span')
                    cursor.classList.add('collaboration-cursor__caret')
                    cursor.style.borderColor = user.color
                    cursor.style.backgroundColor = user.color

                    const label = document.createElement('div')
                    label.classList.add('collaboration-cursor__label')
                    label.setAttribute('title', user.name || 'Unknown')

                    const appendInitial = () => {
                      const initial = document.createElement('span')
                      initial.classList.add('collaboration-cursor__initial')
                      initial.style.backgroundColor = user.color
                      initial.textContent = (user.name || '?').charAt(0).toUpperCase()
                      label.prepend(initial)
                    }

                    if (user.avatar) {
                      const img = document.createElement('img')
                      img.src = user.avatar
                      img.alt = user.name || ''
                      img.classList.add('collaboration-cursor__avatar')
                      img.style.borderColor = user.color
                      img.onerror = () => {
                        img.remove()
                        appendInitial()
                      }
                      label.appendChild(img)
                    } else {
                      appendInitial()
                    }

                    // Name tooltip — hidden by default, shown on hover
                    const nameEl = document.createElement('span')
                    nameEl.classList.add('collaboration-cursor__name')
                    nameEl.style.backgroundColor = user.color
                    nameEl.textContent = user.name || 'Unknown'
                    label.appendChild(nameEl)

                    cursor.appendChild(label)
                    return cursor
                  },
                }),
              ]
            : []),
        ]
      : []),

    // Ensure a paragraph always follows block nodes like images/diagrams,
    // so the user can always click after them to type.
    Extension.create({
      name: 'trailingParagraph',
      addProseMirrorPlugins() {
        return [
          new Plugin({
            appendTransaction(_, __, newState) {
              const { doc, tr, schema } = newState
              const lastNode = doc.lastChild
              if (lastNode && lastNode.type !== schema.nodes.paragraph) {
                return tr.insert(doc.content.size, schema.nodes.paragraph.create())
              }
            },
          }),
        ]
      },
    }),

    // When an image/diagram node is selected (NodeSelection), intercept
    // Enter and printable characters: insert a new paragraph AFTER the node
    // and type there instead of replacing the node.
    // filterTransaction acts as a safety net to block any "type to replace node"
    // transaction that slips through (e.g. from beforeinput events).
    Extension.create({
      name: 'blockNodeKeyProtect',
      addProseMirrorPlugins() {
        return [
          new Plugin({
            filterTransaction(tr, state) {
              const { selection } = state
              if (!selection.node) return true
              const selectedNodeType = selection.node.type
              const { from, to } = selection
              for (const step of tr.steps) {
                if (
                  step instanceof ReplaceStep &&
                  step.from === from &&
                  step.to === to &&
                  step.slice.content.size > 0
                ) {
                  // Allow attribute updates: same node type replacing itself
                  // (setNodeMarkup on leaf nodes creates a ReplaceStep of the same type)
                  const firstChild = step.slice.content.firstChild
                  if (firstChild && firstChild.type === selectedNodeType) {
                    continue
                  }
                  // Block "type to replace node" transactions (user typing over a selected node)
                  return false
                }
              }
              return true
            },
            props: {
              handleKeyDown(view, event) {
                const { selection } = view.state
                if (!selection.node) return false

                if (
                  event.key === 'Enter' ||
                  (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey)
                ) {
                  const pos = selection.to
                  const { state } = view
                  const tr = state.tr.insert(pos, state.schema.nodes.paragraph.create())
                  if (event.key !== 'Enter') {
                    tr.insertText(event.key, pos + 1)
                    tr.setSelection(TextSelection.create(tr.doc, pos + 1 + event.key.length))
                  } else {
                    tr.setSelection(TextSelection.create(tr.doc, pos + 1))
                  }
                  view.dispatch(tr)
                  requestAnimationFrame(() => view.focus())
                  return true
                }
                return false
              },
            },
          }),
        ]
      },
    }),
  ]

  return extensions
}

const editor = useEditor({
  content: cleanTiptapJson(props.modelValue),
  editable: props.editable,
  editorProps: {
    handleDOMEvents: {
      keydown: (view, event) => {
        if (['Control', 'Enter'].indexOf(event.key) > -1) {
          pressedKeys.value.push(event.key)
        }
        if (pressedKeys.value.join('-') === 'Control-Enter') {
          event.preventDefault()
          submited()
        }
      },
      keyup(view, event) {
        pressedKeys.value = pressedKeys.value.filter(key => key !== event.key)
      },
    },
  },
  extensions: getExtensions(),
})

watch(
  editor,
  e => {
    if (e) {
      // If collaborative with Y.doc, populate from content if Y.doc is empty (first time)
      if (props.collaborative && props.ydoc && props.modelValue) {
        const fragment = toRaw(props.ydoc).getXmlFragment('default')
        if (fragment.length === 0) {
          const cleaned = cleanTiptapJson(props.modelValue)
          if (cleaned?.content?.length > 0) {
            e.commands.setContent(cleaned)
          }
        }
      }
      emit('ready', e)

      // Listen for comment events from nested node views (TextToolbar)
      e.view.dom.addEventListener('editor:add-comment', () => emit('add-comment'))
      e.view.dom.addEventListener('editor:remove-comment', () => emit('remove-comment'))
    }
  },
  { immediate: true },
)

defineExpose({ editor })

function getUserColor(id) {
  const hash = String(id)
    .split('')
    .reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0)
  return `hsl(${Math.abs(hash) % 360}, 70%, 60%)`
}

function cleanTiptapJson(rawData) {
  const json = { ...rawData }
  // Recursively clean the content
  function cleanContent(content) {
    return content
      .map(item => {
        // Remove empty text nodes and null text content
        if (item.type === 'text' && (!item.text || item.text.trim() === '')) {
          return null
        }
        if (item.content) {
          item.content = cleanContent(item.content)
        }
        // Remove elements with empty content arrays
        if (item.content && item.content.length === 0) {
          return null
        }
        return item
      })
      .filter(item => item !== null) // Remove null items
  }
  try {
    // Clean the top-level content
    json.content = cleanContent(json?.content ?? [])

    return json
  } catch (e) {
    console.log(e)
    return ''
  }
}
</script>

<template>
  <div
    class="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl"
    :class="{ 'notion-mode': notion }"
  >
    <!-- Static toolbar: shown only when NOT in notion mode -->
    <div v-if="editor && !notion" class="flex-shrink-0">
      <div class="hidden lg:block">
        <EditorHeader :editor="editor" />
      </div>
      <MobileMenu :editor="editor" class="block lg:hidden" />
      <div
        v-if="collaborative && documentId"
        class="px-3 py-1 text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-b border-gray-100 dark:border-gray-800"
      >
        <span class="flex items-center gap-1.5">
          <span
            class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"
          ></span>
          Collaborative mode — Document #{{ documentId }}
        </span>
      </div>
    </div>

    <!-- Slot for content injected between toolbar and editor (e.g. document title) -->
    <div class="flex-shrink-0">
      <slot name="before-content" />
    </div>

    <editor-content v-if="editor" class="editor-content" :editor="editor" />
  </div>
</template>

<style>
.editor-content {
  @apply w-full bg-white dark:bg-gray-900;
  min-height: 60vh;
}

/* Notion variant */
.notion-mode .editor-content {
  background: transparent;
}

.editor-content > .tiptap.ProseMirror {
  @apply min-h-full w-full active:border-none focus:border-none focus:outline-0 overflow-hidden;
  padding: 1rem;
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

table {
  @apply w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400;
}

/* Strip paragraph margins inside list items — TipTap wraps li content in <p> by default */
.tiptap li > p {
  margin: 0;
  display: inline;
}

/* Basic editor styles */
.tiptap :first-child {
  margin-top: 0;
}

.tiptap table .selectedCell:after {
  background: var(--gray-2);
  content: '';
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
.tiptap table {
  border-collapse: collapse;
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

/* Collaboration cursor styles */
.collaboration-cursor__caret {
  border-left: 2px solid;
  margin-left: -1px;
  margin-right: -1px;
  pointer-events: none;
  position: relative;
  word-break: normal;
}

.collaboration-cursor__label {
  position: absolute;
  top: -1.4em;
  left: -1px;
  user-select: none;
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 0;
  z-index: 10;
}

.collaboration-cursor__avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid;
  object-fit: cover;
  display: block;
  flex-shrink: 0;
}

.collaboration-cursor__initial {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
  line-height: 1;
}

.collaboration-cursor__name {
  display: none;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 0 4px 4px 0;
  white-space: nowrap;
  line-height: 16px;
}

.collaboration-cursor__label:hover .collaboration-cursor__name {
  display: block;
}

/* Inline comment highlights */
.comment-highlight {
  background-color: rgba(255, 213, 79, 0.3);
  border-bottom: 2px solid rgba(255, 165, 0, 0.6);
  cursor: pointer;
  transition: background-color 0.15s;
}

.comment-highlight:hover {
  background-color: rgba(255, 213, 79, 0.5);
}

.comment-highlight[data-resolved="true"] {
  background-color: transparent;
  border-bottom: 1px dashed rgba(156, 163, 175, 0.4);
}

.comment-highlight.active {
  background-color: rgba(255, 165, 0, 0.4);
  border-bottom-color: rgba(255, 165, 0, 0.9);
}
</style>
