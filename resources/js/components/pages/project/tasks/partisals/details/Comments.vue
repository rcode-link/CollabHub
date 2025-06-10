<script setup>
import { computed, onBeforeUnmount, ref, onMounted } from "vue";
import useChatLogic from "../../../../../../functions/useChatLogic";
import ChatMessage from "../../../../chat/partials/messages/ChatMessage.vue";

import ShowUser from '../../../../chat/partials/messages/ShowUser.vue'
import { chatDetails } from "../../../../../../store/chatStore.js";
import MessagesFooter from "../../../../chat/partials/messages/Footer.vue";

const messageContainerRef = ref(null)
const props = defineProps({
    chatId: 0,
});
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
        <MessagesFooter :chat-id="chatId" />
    </div>
</template>

<style scoped></style>
