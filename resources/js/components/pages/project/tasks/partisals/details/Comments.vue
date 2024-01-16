<script setup lang="ts">

import {computed, onBeforeUnmount, onMounted} from "vue";
import useChatLogic from "../../../../../../functions/useChatLogic.js";
import ChatMessage from "../../../../chat/partials/messages/ChatMessage.vue";
import {chatDetails} from "../../../../../../store/chatStore.js";
import MessagesFooter from "../../../../chat/partials/messages/Footer.vue";
const props = defineProps({
    chatId: 0
})
const chatLogic = useChatLogic(props.chatId)
const chatStore = chatDetails()

onMounted(() => {
    chatLogic.chatId.value = props.chatId;
    chatLogic.listenForMessages(props.chatId);
    chatLogic.resetMessages();
    chatLogic.loadMessages();
})


onBeforeUnmount(() => {
    Echo.leave(`chat.${props.chatId}`)
})
</script>

<template>
    <div class="-mx-5 ">

    <main
          @scroll="chatLogic.scrolled"
          class="overflow-auto "
    >
            <ChatMessage
                v-for="(obj, ind) in chatStore.messages"
                :hide-user="ind > 0 && chatStore.messages[ind-1]?.user?.id === obj.user.id"
                :key="obj"
                :id="`message-${obj.id}`" :message="obj"/>
    </main>
    <MessagesFooter :chat-id="chatId" />
    </div>
</template>

<style scoped>

</style>
