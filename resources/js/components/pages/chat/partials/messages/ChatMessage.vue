<script setup>
import { FwbAvatar, FwbP } from "flowbite-vue";
import { useUserStore } from "@/store/user";
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import PrintChatMessage from "./PrintChatMessage.vue";
import { chatDetails } from "@/store/chatStore.js";
import { DateTime } from "luxon";

const chatStore = chatDetails();
const user = useUserStore();
const router = useRouter();
const route = useRoute();
const messageContainer = ref(null);
const props = defineProps({
    index: null,
});

const message = computed(() => {
    return chatStore.messages[props.index - 1];
});

function handleFocusOnMessage() {
    if (route.hash === `#message-${message.value.id}`) {
        messageContainer.value?.scrollIntoView();
    }
}

watch(
    () => route.hash,
    () => {
        handleFocusOnMessage();
    },
    {
        deep: true,
        immediate: true,
    }
);
</script>

<template>
    <div ref="messageContainer" class="flex flex-col mx-4 relative">
        <PrintChatMessage :message="message" />
    </div>
</template>
