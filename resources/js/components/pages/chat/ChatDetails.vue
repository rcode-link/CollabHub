<script setup>
import { computed, onUnmounted, reactive, ref, watch } from "vue";
import { FwbButton } from "flowbite-vue";
import { chatDetails } from "@/store/chatStore.js";
import Footer from "./partials/messages/Footer.vue";
import { useRoute, useRouter } from "vue-router";
import ChatMessage from "./partials/messages/ChatMessage.vue";
import Header from "./partials/messages/Header.vue";
import ShowDate from "./partials/messages/ShowDate.vue";
import useChatLogic from "../../../functions/useChatLogic";
import _ from "lodash";
import { DateTime } from "luxon";

const chatStore = chatDetails();
const route = useRoute();
const router = useRouter();
const page = ref(1);

const chatLogic = useChatLogic(route.params.chatId);

const form = reactive({
    message: "",
    files: [],
});

watch(
    () => route.params.chatId,
    (value, oldValue, onCleanup) => {
        if (oldValue) {
            Echo.leave(`chat.${oldValue}`);
        }
        if (!route.params.chatId) {
            return;
        }
        chatLogic.chatId.value = route.params.chatId;
        chatLogic.listenForMessages(route.params.chatId);
        chatLogic.resetMessages();
        chatLogic.page.value = 1;
        axios.get(`/api/v1/chats/${route.params.chatId}`).then((response) => {
            chatStore.setActiveChat(response.data.data);
        });

        axios.post(`/api/v1/chat/${route.params.chatId}/present`);
        chatLogic.loadMessages();
    },
    {
        immediate: true,
    }
);

onUnmounted(async () => {
    await Echo.leave(`chat.${chatLogic.chatId.value}`);
    await axios.post(`/api/v1/chat/${chatLogic.chatId.value}/left`);

    chatLogic.chatId.value = null;
});

const messages = computed(() => {
    return _.groupBy(chatStore.messages, (obj) => {
        return DateTime.fromISO(obj.createdAt).toLocaleString(
            DateTime.DATE_SHORT
        );
    });
});
</script>

<template>
    <div class="chat-details">
        <Header />
        <main @scroll="chatLogic.scrolled" class="overflow-auto pb-2">
            <fwb-button
                size="xs"
                class="ml-auto mr-auto mt-1 mb-1 block"
                @click="() => chatLogic.loadMessages()"
                >Load more</fwb-button
            >
            <div v-for="index in chatStore.messages.length" :key="index">
                <show-date :index="index" />
                <ChatMessage
                    :key="obj"
                    :id="`message-${index}`"
                    :index="index"
                />
            </div>
        </main>
        <Footer />
    </div>
</template>

<style scoped>
.chat-details {
    display: grid;
    margin: -1.5rem;
    grid-auto-rows: minmax(min-content, max-content);
    grid-template-rows: 64px 1fr auto;
    height: 75vh;
}
</style>
