<script setup>
import { useAbility } from '@casl/vue'
import { onMounted, ref, watch } from 'vue'
import { useUserStore } from '../../../../store/user'
import Card from '../../../shared/Card.vue'
import { useRoute, useRouter } from 'vue-router'
import { chatDetails } from '../../../../store/chatStore.js'
import ChatUsersItem from './ChatUsersItem.vue'
import CreateChat from './CreateChat.vue'
import UsersListHeader from './UsersListHeader.vue'
import PlusSquare from '../../../shared/icons/PlusSquare.vue'

const chatState = chatDetails()
const { can } = useAbility()

const route = useRoute()
const router = useRouter()
const userState = useUserStore()

const createTaskModal = ref(null)

const load = () => {
  if (userState.company.id) {
    axios.get(`/api/v1/chats?type=${route.query.type}`).then((res) => {
      chatState.setChatList(res.data.data)
    })
  }
}

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
</script>

<template>
  <div>
    <UsersListHeader>
      <button
        @click="showModal"
        class="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="New chat"
      >
        <PlusSquare class="w-5 h-5" />
      </button>
    </UsersListHeader>

    <Card class="mt-2">
      <ul class="divide-y divide-gray-100 dark:divide-gray-800">
        <li v-for="obj in chatState.chatList" :key="obj.id + userState.onlineUsers">
          <ChatUsersItem :obj="obj" />
        </li>
      </ul>
    </Card>
  </div>
  <CreateChat ref="createTaskModal" @update="load" />
</template>
