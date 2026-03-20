<script setup>
import { ref } from 'vue'
import { chatDetails } from '@/store/chatStore.js'
import { useRoute, useRouter } from 'vue-router'
import PhoneIcon from '@/components/shared/icons/PhoneIcon.vue'
import UserIcon from '@/components/shared/UserIcon.vue'
import Task from '@/components/shared/icons/Task.vue'
import EarthIcon from '@/components/shared/icons/EarthIcon.vue'
import WebhookIcon from '@/components/shared/icons/WebhookIcon.vue'
import FileFile from '@/components/shared/icons/FileFile.vue'
import CogsIcon from '@/components/shared/icons/CogsIcon.vue'
import ChatSettings from '@/components/pages/chat/partials/ChatSettings.vue'

const emit = defineEmits(['toggleSearch', 'chatUpdated'])
const chatStore = chatDetails()
const route = useRoute()
const router = useRouter()
const chatSettingsModal = ref(null)

const isWebhook = (type) => type === 'webhook' || type === 'app\\models\\webhook'

const startCall = () => {
  axios.post(`/api/v1/video-call/${route.params.chatId}/start`).then((res) => {
    router.push({ query: { callId: res.data.slug } })
  })
}

const makeLink = () => {
  if (['user', 'group'].includes(chatStore.activeChat.type)) {
    return `/user/${chatStore.activeChat.chatable_id}`
  }
  return `/open/${chatStore.activeChat.item_key}`
}
</script>

<template>
  <header class="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
    <!-- Back button — mobile only -->
    <button
      class="lg:hidden -ml-1 mr-1 inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
      title="Back to chats"
      @click="router.push({ name: 'chat' })"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>

    <!-- Avatar -->
    <div class="flex-shrink-0">
      <UserIcon
        v-if="['user', 'group'].includes(chatStore.activeChat.type)"
        :user="chatStore.activeChat"
        class="w-9 h-9"
      />
      <div
        v-else-if="isWebhook(chatStore.activeChat.type)"
        class="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white"
      ><WebhookIcon class="w-5 h-5" /></div>
      <Task v-else-if="chatStore.activeChat.type === 'app\\models\\task'" class="w-9 h-9" />
      <img
        v-else-if="chatStore.activeChat.type === 'app\\models\\company' && chatStore.activeChat.avatar"
        :src="chatStore.activeChat.avatar"
        class="w-9 h-9 rounded-full object-cover"
      />
      <EarthIcon v-else-if="chatStore.activeChat.type === 'app\\models\\event'" class="w-9 h-9" />
      <div
        v-else-if="chatStore.activeChat.type === 'app\\models\\file'"
        class="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white"
      ><FileFile class="w-5 h-5" /></div>
    </div>

    <!-- Title -->
    <router-link :to="makeLink()" class="flex-1 min-w-0 no-underline">
      <h2 class="text-sm font-semibold text-gray-900 dark:text-white truncate">
        {{ chatStore.activeChat.title }}
      </h2>
    </router-link>

    <!-- Actions -->
    <div class="flex items-center gap-1 flex-shrink-0">
      <button
        class="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="Search messages"
        @click="emit('toggleSearch')"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
      </button>

      <button
        v-if="['user', 'group'].includes(chatStore.activeChat.type)"
        class="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="Start video call"
        @click="startCall"
      >
        <PhoneIcon class="w-4 h-4" />
      </button>

      <button
        class="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="Chat settings"
        @click="chatSettingsModal.modal.toggleModal()"
      >
        <CogsIcon class="w-4 h-4" />
      </button>
    </div>

    <ChatSettings
      ref="chatSettingsModal"
      :chat="chatStore.activeChat"
      @updated="emit('chatUpdated')"
    />
  </header>
</template>
