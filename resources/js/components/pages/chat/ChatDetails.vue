<script setup>
import {
    computed,
    onMounted,
    onUnmounted,
    onUpdated,
    reactive,
    ref,
    watch,
    nextTick,
} from 'vue'
import { FwbButton } from 'flowbite-vue'
import { chatDetails } from '@/store/chatStore.js'
import Footer from './partials/messages/Footer.vue'
import { useRoute, useRouter } from 'vue-router'
import ChatMessage from './partials/messages/ChatMessage.vue'
import Header from './partials/messages/Header.vue'
import ShowDate from './partials/messages/ShowDate.vue'
import ShowUser from './partials/messages/ShowUser.vue'
import useChatLogic from '../../../functions/useChatLogic'
import _ from 'lodash'
import { DateTime } from 'luxon'
import { useTippy } from 'vue-tippy'
import MessageOptions from './partials/messages/MessageOptions.vue'

const chatStore = chatDetails()
const route = useRoute()
const router = useRouter()
const page = ref(1)
const messageContainerRef = ref(null)

const chatLogic = useChatLogic(route.params.chatId, messageContainerRef)
const messageMenuId = ref(null)
const form = reactive({
    message: '',
    files: [],
})

watch(
    () => route.params.chatId,
    async (value, oldValue, onCleanup) => {
        if (oldValue) {
            Echo.leave(`chat.${oldValue}`)
        }
        if (!route.params.chatId) {
            return
        }
        chatLogic.chatId.value = route.params.chatId
        chatLogic.listenForMessages(route.params.chatId)
        chatLogic.resetMessages()
        axios.get(`/api/v1/chats/${route.params.chatId}`).then(response => {
            chatStore.setActiveChat(response.data.data)
        })

        chatLogic.loadMessages()
    },
    {
        immediate: true,
    },
)

onUpdated(() => {
    if (chatLogic.page.value !== 1 || !chatLogic.scrollToLastMessage.value) {
        return
    }
    setTimeout(() => chatLogic.scrollToBottom())
})

onUnmounted(async () => {
    await Echo.leave(`chat.${chatLogic.chatId.value}`)

    chatLogic.chatId.value = null
})
</script>
<template>
    <div class="chat-details">
        <Header />
        <main ref="messageContainerRef" @scroll="chatLogic.scrolled"
            class="overflow-auto max-w-full pb-2 message-container">
            <!-- Loading indicator at top when loading older messages -->
            <div v-if="chatLogic.isLoadingMore" class="text-center p-2 text-gray-500">
                Loading older messages...
            </div>

            <template v-for="(obj, index) in chatStore.messages" :key="obj">
                <!-- <ShowDate :index="index" /> -->
                <show-user :user="obj.user" :messageId="obj.id" :messageDateTime="obj.createdAt" />
                <ChatMessage :message="obj" :index="index" />
            </template>

            <MessageOptions v-if="chatStore.selectedMessage" />

            <!-- Add invisible marker at the end for scrolling to bottom -->
            <div class="h-1 w-full" id="messages-end"></div>
        </main>

        <!-- New Messages Button (only show when not at bottom) -->
        <div v-show="chatLogic.showScrollToBottom.value === 1" class="new-messages-button">
            <FwbButton color="blue" size="sm" class="px-3 py-1 shadow-md" @click="chatLogic.scrollToBottom">
                Latest Messages ↓
            </FwbButton>
        </div>

        <Footer />
    </div>
</template>

<style scoped>
.chat-details {
    display: grid;
    margin: -1.5rem;
    grid-auto-rows: minmax(min-content, max-content);
    grid-template-rows: 64px 1fr auto;
    height: 80vh;
    position: relative;
}

.message-container {
    scroll-behavior: smooth;
    position: relative;
}

.new-messages-button {
    position: absolute;
    bottom: 80px;
    /* Adjust based on your footer height */
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
}
</style>
