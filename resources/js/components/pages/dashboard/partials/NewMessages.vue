<script setup>
import { ref } from 'vue'
import Card from '@/components/shared/Card.vue'
import ChatUsersItem from '@/components/pages/chat/partials/ChatUsersItem.vue'

const messages = ref([])
const loadNumberOfUnreadMessages = () => {
  window.axios.get('/api/v1/dashboard/messages').then(res => {
    messages.value = res.data.data
  })
}
loadNumberOfUnreadMessages()
</script>

<template>
  <Card>
    <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
      <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Recent Messages</h3>
    </div>
    <div v-if="messages.length === 0" class="px-4 py-8 text-center">
      <p class="text-sm text-gray-500 dark:text-gray-400">No new messages</p>
    </div>
    <ul v-else class="divide-y divide-gray-100 dark:divide-gray-800">
      <li v-for="obj in messages" :key="obj.id">
        <ChatUsersItem :obj="obj" />
      </li>
    </ul>
  </Card>
</template>
