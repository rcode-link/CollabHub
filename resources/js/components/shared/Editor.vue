<script setup>
import { EditorContent, useEditor } from '@tiptap/vue-3'
import Placeholder from '@tiptap/extension-placeholder'
import AuthImageExtension from '@/functions/editor/AuthImageExtension'
import StarterKit from '@tiptap/starter-kit'
import { Link } from '@tiptap/extension-link'
import { ref, computed } from 'vue'
import { createLowlight } from 'lowlight'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import drawIoExtension from '@rcode-link/tiptap-drawio'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import tableExtension from '@/functions/editor/TableExtension'
import hljs from 'highlight.js'
import Mention from '@tiptap/extension-mention'
import useSuggestion from '@/functions/editor/mention/suggestion'
import { SmilieReplacer } from '@/functions/smilieReplacer'
import { useConvertTextToLink } from '@/functions/editor/convertTextToLink'
import { chatDetails } from '@/store/chatStore'
import vacation from '@/components/shared/vacationPlugin/vacation'
import { Markdown } from 'tiptap-markdown'
import { useTextToLinkStore } from '@/store/textToLinkStore'
import { LinkPreviewExtension } from '@/functions/editor/LinkPreviewExtension.js'
import { useRouter } from 'vue-router'
import { debounce } from '@/functions/debounce'
const chatStore = chatDetails()
const router = useRouter()
const props = defineProps({
  modelValue: '',
  model: '',
  cssClass: '',
  defaultShowPreview: true,
  editable: true,
  submitOnEnter: false,
  placeholder: { type: String, default: '' },
})

const pressedKeys = ref([])

const textToLinkStore = useTextToLinkStore()
const textToLink = useConvertTextToLink(textToLinkStore.items, router.push)
const emit = defineEmits(['update:modelValue', 'submitted'])

const lowlight = createLowlight()

hljs.listLanguages().forEach(async lang => {
  //@ts-ignore
  lowlight.register(lang, hljs.getLanguage(lang).rawDefinition)
})

const suggestion = useSuggestion()

const shouldISubmit = () => {
  if (
    props.submitOnEnter &&
    pressedKeys.value.indexOf('Enter') > -1 &&
    pressedKeys.value.indexOf('Shift') === -1
  ) {
    return true
  }

  if (!props.submitOnEnter && pressedKeys.value.join('-') === 'Control-Enter') {
    return true
  }
  return false
}

const editor = useEditor({
  content: props.model ?? props.modelValue,
  editable: props.editable,
  editorProps: {
    handleDOMEvents: {
      keydown: (view, event) => {
        if (['Control', 'Enter', 'Shift'].indexOf(event.key) > -1) {
          pressedKeys.value.push(event.key)
        }
        if (shouldISubmit()) {
          event.preventDefault()

          emit('update:modelValue', editor.value?.getJSON())
          emit('submitted', true)
        }
      },
      keyup(view, event) {
        pressedKeys.value = pressedKeys.value.filter(key => key !== event.key)
      },
      blur(view, event) {
        // Update the model value when focus leaves the editor
        emit('update:modelValue', editor.value?.getJSON())
      },
      click(view, event) {
        const link = event.target.closest('a')
        if (!link) return
        const href = link.getAttribute('href')
        if (href && href.includes('/api/v1/')) {
          event.preventDefault()
          event.stopPropagation()
          window.axios.get(href).then(({ data }) => {
            window.open(data.url, '_blank')
          })
        }
      },
    },
    handlePaste: function (view, event, slice) {
      const items = Array.from(event.clipboardData?.items || []).filter(
        obj => obj.kind === 'file',
      )
      chatStore.addFiles(items.map(obj => obj.getAsFile()))
    },
  },
  extensions: [
    StarterKit,
    Mention.configure({
      HTMLAttributes: {
        class: 'mention',
      },
      suggestion: suggestion.plugin,
    }),
    Link.configure({
      openOnClick: false,
      autolink: true,
    }),
    // Only use LinkPreviewExtension in document editors, not chat composer.
    // In chat, the Link extension handles URLs as marks; RenderMessage + LinkTooltip
    // handle display and hover previews.
    ...(props.submitOnEnter ? [] : [LinkPreviewExtension.configure({
      defaultShowPreview: props.editable !== true,
      fetchMetadata: async url => {
        const data = await window.axios
          .post('/api/v1/link-preview', { url })
          .then(res => res.data)
        return {
          url: data.url,
          title: data.title || url,
          description: data.description || '',
          image: data.image || null,
        }
      },
    })]),
    CodeBlockLowlight.configure({
      lowlight,
    }),
    vacation,
    drawIoExtension.configure({ openDialog: 'dblclick' }),
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
    AuthImageExtension.configure({ inline: false, allowBase64: false }),
    ...(props.placeholder ? [Placeholder.configure({ placeholder: props.placeholder })] : []),
  ],
  onUpdate: ({ editor }) => {
    debounce(() => emit('update:modelValue', editor.value?.getJSON()), 300)
    // Only emit on blur or when the form is submitted, not on every change
  },
})

defineExpose({
  editor,
})
</script>

<template>
  <editor-content :editor="editor" :class="props.cssClass" />
</template>

<style scoped></style>
