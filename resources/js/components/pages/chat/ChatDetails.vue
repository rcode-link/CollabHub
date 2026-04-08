<script setup>
import { onUnmounted, onUpdated, reactive, ref, watch } from 'vue'
import { chatDetails } from '@/store/chatStore.js'
import Footer from '@/components/pages/chat/partials/messages/Footer.vue'
import { useRoute, useRouter } from 'vue-router'
import ChatMessage from '@/components/pages/chat/partials/messages/ChatMessage.vue'
import Header from '@/components/pages/chat/partials/messages/Header.vue'
import ShowUser from '@/components/pages/chat/partials/messages/ShowUser.vue'
import useChatLogic from '@/functions/useChatLogic'
import MessageOptions from '@/components/pages/chat/partials/messages/MessageOptions.vue'
import SearchMessages from '@/components/pages/chat/partials/messages/SearchMessages.vue'

const chatStore = chatDetails()
const showSearch = ref(false)
const route = useRoute()
const messageContainerRef = ref(null)

const chatLogic = useChatLogic(route.params.chatId, messageContainerRef)

watch(
  () => route.params.chatId,
  async (value, oldValue) => {
    if (oldValue) Echo.leave(`chat.${oldValue}`)
    if (!route.params.chatId) return
    chatLogic.chatId.value = route.params.chatId
    chatLogic.listenForMessages(route.params.chatId)
    chatLogic.resetMessages()
    axios.get(`/api/v1/chats/${route.params.chatId}`).then(response => {
      chatStore.setActiveChat(response.data.data)
    })
    chatLogic.loadMessages()
  },
  { immediate: true },
)

onUpdated(() => {
  if (chatLogic.page.value !== 1 || !chatLogic.scrollToLastMessage.value) return
  setTimeout(() => chatLogic.scrollToBottom())
})

onUnmounted(async () => {
  await Echo.leave(`chat.${chatLogic.chatId.value}`)
  chatLogic.chatId.value = null
})
</script>

<template>
  <div class="chat-details">
    <Header @toggle-search="showSearch = true" />
    <SearchMessages v-if="showSearch" @close="showSearch = false" />

    <main
      ref="messageContainerRef"
      @scroll="chatLogic.scrolled"
      class="overflow-auto max-w-full pb-2 message-container"
    >
      <div
        v-if="chatLogic.isLoadingMore.value"
        class="text-center py-3 text-xs text-gray-400"
      >
        <svg class="animate-spin h-4 w-4 mx-auto text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>

      <template v-for="(obj, index) in chatStore.messages" :key="obj">
        <show-user
          :user="obj.user"
          :webhook-meta="obj.webhook_meta"
          :messageId="obj.id"
          :messageDateTime="obj.createdAt"
        />
        <ChatMessage :message="obj" :index="index" />
      </template>

      <MessageOptions v-if="chatStore.selectedMessage" />
      <div class="h-1 w-full" id="messages-end" />
    </main>

    <!-- Scroll to bottom -->
    <div
      v-show="chatLogic.showScrollToBottom.value === 1"
      class="new-messages-button"
    >
      <button
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium shadow-lg hover:bg-blue-500 transition-colors"
        @click="chatLogic.scrollToBottom"
      >
        Latest messages ↓
      </button>
    </div>

    <Footer />
  </div>
</template>

<style scoped>
.chat-details {
  display: grid;
  grid-auto-rows: minmax(min-content, max-content);
  grid-template-rows: 56px 1fr auto;
  height: 100%;
  position: relative;
}

.message-container {
  scroll-behavior: smooth;
  position: relative;
  overflow-anchor: none;
}

.new-messages-button {
  position: absolute;
  bottom: 90px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}
</style>
