<script setup>
import { computed, ref } from 'vue'
import { chatDetails } from '@/store/chatStore.js'
import { useRoute } from 'vue-router'
import FilesComponent from '@/components/pages/chat/partials/messages/FilesComponent.vue'
import Editor from '@/components/shared/Editor.vue'
import TrashIcon from '@/components/shared/icons/TrashIcon.vue'
import InteractiveToast from '@/components/shared/InteractiveToast.vue'
import 'vue3-emoji-picker/css'
import Emoji from '@/components/shared/Emoji.vue'

const props = defineProps({ chatId: null })
const chatMessageStore = chatDetails()
const route = useRoute()
const editorRef = ref()

const activeMessage = computed(() =>
  chatMessageStore.messages.find(m => m.id === chatMessageStore.reply_to_message_id)
)

const hasContent = computed(() => {
  if (chatMessageStore.files.length > 0) return true
  if (!editorRef.value?.editor) return false
  return editorRef.value.editor.getHTML().length > 7
})

const submit = () => {
  if (editorRef.value.editor.getHTML().length === 7 && chatMessageStore.files.length === 0) return
  const chatId = route.params.chatId ?? props.chatId
  const form = new FormData()
  form.append('message', JSON.stringify(editorRef.value.editor.getJSON()))
  chatMessageStore.files.forEach((file, index) => { form.append(`files[${index}]`, file) })
  if (chatMessageStore.reply_to_message_id !== null) {
    form.append('parent_id', chatMessageStore.reply_to_message_id)
  }
  axios.post(`/api/v1/chats/${chatId}/message`, form)
  editorRef.value.editor.commands.setContent('')
  chatMessageStore.resetMessageForm()
  chatMessageStore.setReplyToMessageId(null)
  chatMessageStore.setChatOnTopOfTheList(route.params.chatId)
}

function onSelectEmoji(emoji) {
  editorRef.value.editor.commands.insertContent(emoji.i)
}
</script>

<template>
  <div class="px-3 pb-3 pt-1">
    <form @submit.prevent="submit" class="composer-box">
      <!-- Reply-to banner -->
      <div v-if="activeMessage" class="flex items-center gap-2 px-3 pt-2.5 pb-1">
        <div class="w-0.5 h-8 rounded-full bg-blue-500 flex-shrink-0" />
        <div class="flex-1 min-w-0">
          <p class="text-xs font-medium text-blue-600 dark:text-blue-400">
            Replying to {{ activeMessage.user?.name || 'message' }}
          </p>
          <Editor class="h-4 overflow-hidden text-xs opacity-60" :editable="false" :model="activeMessage.message" />
        </div>
        <InteractiveToast>
          <template #trigger>
            <button type="button" class="flex-shrink-0 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 transition-colors">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </template>
          <template #title><span>Dismiss reply?</span></template>
          <template #content>You are about to dismiss reply to message.</template>
          <template #actions>
            <button
              type="button"
              class="px-2 py-1 text-xs rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors"
              @click="chatMessageStore.setReplyToMessageId(null)"
            >Yes</button>
          </template>
        </InteractiveToast>
      </div>

      <!-- File previews -->
      <div v-if="chatMessageStore.files.length > 0" class="flex flex-wrap gap-2 px-3 pt-2">
        <FilesComponent
          v-for="(file, index) in chatMessageStore.files"
          :file="file"
          :index="index"
          :key="index"
        />
      </div>

      <!-- Editor area -->
      <div class="px-1">
        <Editor
          ref="editorRef"
          v-model="chatMessageStore.message"
          css-class="composer-editor"
          @submitted="submit"
          :submitOnEnter="true"
          placeholder="Message this chat…"
        />
      </div>

      <!-- Toolbar -->
      <div class="flex items-center justify-between px-2 pb-1.5 pt-0.5">
        <div class="flex items-center gap-0.5">
          <!-- Emoji -->
          <Emoji @select="onSelectEmoji" class="toolbar-btn" />

          <!-- File attachment -->
          <input
            type="file"
            class="hidden"
            id="addFile"
            @change="value => { chatMessageStore.addFiles(value.target.files); value.target.value = '' }"
            multiple
          />
          <label
            for="addFile"
            class="toolbar-btn"
            title="Attach file"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </label>
        </div>

        <span class="hidden sm:inline text-[11px] text-gray-400 dark:text-gray-500 select-none">
          <kbd class="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-[10px] font-mono">Shift</kbd>
          +
          <kbd class="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-[10px] font-mono">Enter</kbd>
          new line
        </span>

        <!-- Send button -->
        <button
          type="submit"
          class="send-btn"
          :class="hasContent ? 'send-btn-active' : 'send-btn-inactive'"
          title="Send (Enter)"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.composer-box {
  @apply border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-sm transition-colors;
}

.composer-box:focus-within {
  @apply border-blue-400 dark:border-blue-500 ring-1 ring-blue-400/20;
}

.composer-editor {
  overflow: auto;
  min-height: 36px;
  max-height: 120px;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.5;
}

.composer-editor :deep(.tiptap.ProseMirror) {
  outline: none;
  min-height: 20px;
}

.composer-editor :deep(.tiptap.ProseMirror p.is-editor-empty:first-child::before) {
  @apply text-gray-400 dark:text-gray-500;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

.toolbar-btn {
  @apply inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer;
}

.send-btn {
  @apply inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150;
}

.send-btn-active {
  @apply bg-blue-600 text-white hover:bg-blue-500 shadow-sm;
}

.send-btn-inactive {
  @apply text-gray-300 dark:text-gray-600 cursor-default;
}
</style>
