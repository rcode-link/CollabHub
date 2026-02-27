<script setup>
import { useAbility } from '@casl/vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useUserStore } from '@/store/user'
import Card from '@/components/shared/Card.vue'
import { useRoute, useRouter } from 'vue-router'
import { chatDetails } from '@/store/chatStore.js'
import ChatUsersItem from '@/components/pages/chat/partials/ChatUsersItem.vue'
import CreateChat from '@/components/pages/chat/partials/CreateChat.vue'
import CreateWebhook from '@/components/pages/chat/partials/CreateWebhook.vue'
import UsersListHeader from '@/components/pages/chat/partials/UsersListHeader.vue'
import PlusSquare from '@/components/shared/icons/PlusSquare.vue'
import WebhookIcon from '@/components/shared/icons/WebhookIcon.vue'

const chatState = chatDetails()
const { can } = useAbility()

const route = useRoute()
const router = useRouter()
const userState = useUserStore()

const createTaskModal = ref(null)
const createWebhookModal = ref(null)
const search = ref('')

const load = () => {
  if (userState.company.id) {
    axios.get(`/api/v1/chats?type=${route.query.type}`).then((res) => {
      chatState.setChatList(res.data.data)
    })
  }
}

const filteredChats = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return chatState.chatList
  return chatState.chatList.filter(chat => {
    const title = (chat.title || '').toLowerCase()
    const lastMsg = (chat.message?.text || '').toLowerCase()
    return title.includes(q) || lastMsg.includes(q)
  })
})

watch(() => userState.company, () => { load() }, { immediate: true, deep: true })
watch(() => route.query.type, (value, oldValue) => { if (value !== oldValue) load() }, { deep: true })

onMounted(() => {
  Echo.private('UpdateChatForUser.' + userState.user.id).listen('ChatUpdate', (data) => {
    chatState.updateChatListMessage(data)
  })
})

const showModal = () => {
  createTaskModal.value.modal.toggleModal()
}

const showWebhookModal = () => {
  createWebhookModal.value.modal.toggleModal()
}
</script>

<template>
  <div>
    <UsersListHeader>
      <div class="flex items-center gap-1">
        <button
          @click="showWebhookModal"
          class="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="New webhook"
        >
          <WebhookIcon class="w-4 h-4" />
        </button>
        <button
          @click="showModal"
          class="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="New chat"
        >
          <PlusSquare class="w-5 h-5" />
        </button>
      </div>
    </UsersListHeader>

    <!-- Search -->
    <div class="relative mt-2">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        v-model="search"
        type="text"
        placeholder="Search chats…"
        class="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>

    <Card class="mt-2">
      <ul class="divide-y divide-gray-100 dark:divide-gray-800">
        <li v-for="obj in filteredChats" :key="obj.id + userState.onlineUsers">
          <ChatUsersItem :obj="obj" />
        </li>
        <li v-if="search && !filteredChats.length" class="px-3 py-4 text-center text-sm text-gray-400">
          No chats found
        </li>
      </ul>
    </Card>
  </div>
  <CreateChat ref="createTaskModal" @update="load" />
  <CreateWebhook ref="createWebhookModal" @update="load" />
</template>
