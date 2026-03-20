<script setup>
import { BubbleMenu } from '@tiptap/vue-3'
import { computed } from 'vue'
import TextBold from '@/components/shared/icons/TextBold.vue'
import TextItalic from '@/components/shared/icons/TextItalic.vue'
import TextStroke from '@/components/shared/icons/TextStroke.vue'
import CodeIcon from '@/components/shared/icons/CodeIcon.vue'
import ToolbarBtn from '@/components/shared/advancedEditor/toolbar/ToolbarBtn.vue'
import ToolbarSep from '@/components/shared/advancedEditor/toolbar/ToolbarSep.vue'

const props = defineProps({
  editor: Object,
  collaborative: { type: Boolean, default: false },
})
const emit = defineEmits(['add-comment', 'remove-comment'])

const activeTextType = computed(() => {
  if (!props.editor) return 'P'
  for (let i = 1; i <= 3; i++) {
    if (props.editor.isActive('heading', { level: i })) return `H${i}`
  }
  return 'P'
})

const textTypes = [
  { label: 'Paragraph', short: 'P', cmd: () => props.editor.chain().focus().setParagraph().run() },
  { label: 'Heading 1', short: 'H1', cmd: () => props.editor.chain().focus().toggleHeading({ level: 1 }).run() },
  { label: 'Heading 2', short: 'H2', cmd: () => props.editor.chain().focus().toggleHeading({ level: 2 }).run() },
  { label: 'Heading 3', short: 'H3', cmd: () => props.editor.chain().focus().toggleHeading({ level: 3 }).run() },
]

const hasCommentMark = computed(() => {
  if (!props.editor) return false
  return props.editor.isActive('comment')
})

const tippyOptions = { duration: 100, maxWidth: 'none', placement: 'top-start' }
</script>

<template>
  <BubbleMenu
    v-if="editor"
    :editor="editor"
    :tippy-options="tippyOptions"
    class="bubble-toolbar"
  >
    <div class="flex items-center gap-0.5 px-1.5 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl">

      <!-- Text type picker -->
      <div class="relative group">
        <button class="tb-btn min-w-[2rem] text-xs font-semibold px-1.5">
          {{ activeTextType }}
          <svg class="w-2.5 h-2.5 ml-0.5 opacity-50 inline" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/>
          </svg>
        </button>
        <div class="hidden group-hover:flex group-focus-within:flex flex-col absolute bottom-full left-0 mb-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 z-50 min-w-[110px]">
          <button
            v-for="t in textTypes"
            :key="t.label"
            class="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-left w-full whitespace-nowrap"
            @click="t.cmd()"
          >
            <span class="font-mono text-xs text-gray-400 w-4">{{ t.short }}</span>
            {{ t.label }}
          </button>
        </div>
      </div>

      <ToolbarSep />

      <!-- Inline formatting -->
      <ToolbarBtn :active="editor.isActive('bold')"   title="Bold (Ctrl+B)"   @click="editor.chain().focus().toggleBold().run()">   <TextBold   class="w-3.5 h-3.5"/></ToolbarBtn>
      <ToolbarBtn :active="editor.isActive('italic')" title="Italic (Ctrl+I)" @click="editor.chain().focus().toggleItalic().run()"><TextItalic class="w-3.5 h-3.5"/></ToolbarBtn>
      <ToolbarBtn :active="editor.isActive('strike')" title="Strikethrough"   @click="editor.chain().focus().toggleStrike().run()"><TextStroke class="w-3.5 h-3.5"/></ToolbarBtn>

      <ToolbarSep />

      <!-- Code block -->
      <ToolbarBtn :active="editor.isActive('codeBlock')" title="Code block" @click="editor.chain().focus().toggleCodeBlock().run()"><CodeIcon class="w-3.5 h-3.5"/></ToolbarBtn>

      <!-- Link toggle -->
      <ToolbarBtn
        :active="editor.isActive('link')"
        title="Link"
        @click="editor.isActive('link')
          ? editor.chain().focus().unsetLink().run()
          : editor.chain().focus().setLink({ href: prompt('URL') || '' }).run()"
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
        </svg>
      </ToolbarBtn>

      <!-- Comment actions (only in collaborative mode) -->
      <template v-if="collaborative">
        <ToolbarSep />

        <!-- Add comment -->
        <ToolbarBtn
          v-if="!hasCommentMark"
          title="Add comment"
          @click="emit('add-comment')"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            <path d="M12 8v4M10 10h4"/>
          </svg>
        </ToolbarBtn>

        <!-- Remove comment highlight -->
        <ToolbarBtn
          v-if="hasCommentMark"
          title="Remove comment highlight"
          @click="emit('remove-comment')"
        >
          <svg class="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            <path d="M9 10h6"/>
          </svg>
        </ToolbarBtn>
      </template>

    </div>
  </BubbleMenu>
</template>

<style>
.bubble-toolbar {
  z-index: 50;
}
</style>
