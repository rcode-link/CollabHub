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

const submit = () => {
  if (editorRef.value.editor.getHTML().length === 7) return
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
  <form @submit.prevent="submit" class="border-t border-gray-100 dark:border-gray-800 px-3 py-2">
    <!-- File previews -->
    <div v-if="chatMessageStore.files.length > 0" class="flex flex-wrap gap-2 mb-2 px-1">
      <FilesComponent
        v-for="(file, index) in chatMessageStore.files"
        :file="file"
        :index="index"
        :key="index"
      />
    </div>

    <!-- Reply-to banner -->
    <div v-if="activeMessage" class="flex items-center gap-2 mb-1.5 px-2 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div class="flex-1 min-w-0">
        <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">Reply to:</p>
        <Editor class="h-4 overflow-hidden text-xs" :editable="false" :model="activeMessage.message" />
      </div>
      <InteractiveToast>
        <template #trigger>
          <button type="button" class="flex-shrink-0 p-1 rounded text-gray-400 hover:text-red-500 transition-colors">
            <TrashIcon class="w-3.5 h-3.5" />
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

    <!-- Compose row -->
    <div class="relative flex items-end gap-1">
      <div class="flex-1">
        <Editor
          ref="editorRef"
          v-model="chatMessageStore.message"
          css-class="input send-message-editor"
          @submitted="submit"
          :submitOnEnter="true"
        />
      </div>

      <div class="flex items-center gap-1 mb-0.5 flex-shrink-0">
        <Emoji @select="onSelectEmoji" />

        <input
          type="file"
          class="hidden"
          id="addFile"
          @change="value => chatMessageStore.addFiles(value.target.files)"
          multiple
        />
        <label
          for="addFile"
          class="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          title="Attach file"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 16 20" stroke="currentColor" stroke-width="2">
            <path stroke-linejoin="round" d="M6 1v4a1 1 0 0 1-1 1H1m14-4v16a.97.97 0 0 1-.933 1H1.933A.97.97 0 0 1 1 18V5.828a2 2 0 0 1 .586-1.414l2.828-2.828A2 2 0 0 1 5.828 1h8.239A.97.97 0 0 1 15 2Z" />
          </svg>
        </label>
      </div>
    </div>
  </form>
</template>

<style scoped>
.send-message-editor {
  overflow: auto;
  min-height: 42px;
  max-height: 84px;
}
</style>
