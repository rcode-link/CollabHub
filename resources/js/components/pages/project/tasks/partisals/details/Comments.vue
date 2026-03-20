<script setup>
import { computed, onBeforeUnmount, ref, onMounted, watch } from "vue";
import useChatLogic from "@/functions/useChatLogic";
import ChatMessage from "@/components/pages/chat/partials/messages/ChatMessage.vue";

import ShowUser from '@/components/pages/chat/partials/messages/ShowUser.vue'
import { chatDetails } from "@/store/chatStore.js";
import MessagesFooter from "@/components/pages/chat/partials/messages/Footer.vue";

const messageContainerRef = ref(null)
const props = defineProps({
    chatId: { type: [Number, String], default: 0 },
    pendingComment: { type: Object, default: null },
    activeCommentId: { type: String, default: null },
});
const emit = defineEmits(['comment-sent']);
const chatLogic = useChatLogic(props.chatId, messageContainerRef);
const chatStore = chatDetails();

onMounted(() => {
    chatLogic.chatId.value = props.chatId;
    chatLogic.listenForMessages(props.chatId);
    chatLogic.resetMessages();
    axios.get(`/api/v1/chats/${props.chatId}`).then(response => {
        chatStore.setActiveChat(response.data.data)
    })

    chatLogic.loadMessages()

});

onBeforeUnmount(() => {
    Echo.leave(`chat.${props.chatId}`);
});

// Scroll to the message with the active comment_id
watch(() => props.activeCommentId, (cId) => {
    if (!cId || !messageContainerRef.value) return
    const msg = chatStore.messages.find(m => m.comment_id === cId)
    if (msg) {
        const el = messageContainerRef.value.querySelector(`[data-message-id="${msg.id}"]`)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
})
</script>

<template>
    <div class="-mx-5">
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
        <MessagesFooter
            :chat-id="chatId"
            :pending-comment="pendingComment"
            @comment-sent="emit('comment-sent')"
        />
    </div>
</template>

<style scoped></style>
