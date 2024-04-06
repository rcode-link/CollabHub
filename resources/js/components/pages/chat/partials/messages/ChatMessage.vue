<script setup>
import { FwbAvatar, FwbP } from "flowbite-vue";
import { useUserStore } from "@/store/user";
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import PrintChatMessage from "./PrintChatMessage.vue";
import { chatDetails } from "@/store/chatStore.js";

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

const showUser = computed(() => {
    if (props.index - 1 === 0) {
        return true;
    }

    if (
        chatStore.messages[props.index - 1].user.id !=
        chatStore.messages[props.index - 2].user.id
    ) {
        return true;
    }
    return false;
});

function handleFocusOnMessage() {
    if (route.hash === `#message-${message.id}`) {
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
    <div ref="messageContainer" class="flex flex-col mx-4">
        <router-link
            v-if="showUser"
            :to="`/user/${message.user.id}`"
            :class="{ 'mb-1 mt-2 flex gap-1 items-center': true }"
        >
            <fwb-avatar :img="message.user.avatar" />
            <fwb-p class="font-bold">
                <div>
                    {{ message.user.name }}
                </div>
                <div class="text-xs mb-auto">
                    {{ message.user.email }}
                </div>
            </fwb-p>
        </router-link>
        <PrintChatMessage :message="message" />
    </div>
</template>
