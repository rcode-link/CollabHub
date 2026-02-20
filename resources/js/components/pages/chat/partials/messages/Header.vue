<script setup>
import { FwbButton } from "flowbite-vue";
import { chatDetails } from "../../../../../store/chatStore.js";
import { useRoute, useRouter } from "vue-router";
import PhoneIcon from "../../../../shared/icons/PhoneIcon.vue";
import UserIcon from "../../../../shared/UserIcon.vue";
import Task from "../../../../shared/icons/Task.vue";
import EarthIcon from "../../../../shared/icons/EarthIcon.vue";

const emit = defineEmits(['toggleSearch']);
const chatStore = chatDetails();
const route = useRoute();
const router = useRouter();

const startCall = () => {
    axios.post(`/api/v1/video-call/${route.params.chatId}/start`).then((res) => {
        router.push({ query: { callId: res.data.slug } });
    });
};

const makeLink = () => {
    if (["user", "group"].indexOf(chatStore.activeChat.type) > -1) {
        return `/user/${chatStore.activeChat.chatable_id}`;
    }
    return `/open/${chatStore.activeChat.item_key}`;
};
</script>

<template>
    <header class="shadow py-6 px-4 flex gap-4 items-center relative">
        <UserIcon v-if="['user', 'group'].indexOf(chatStore.activeChat.type) > -1" :user="chatStore.activeChat"
            class="min-w-10 w-10 h-10 rounded" />
        <template v-else>
            <Task v-if="chatStore.activeChat.type === 'app\\models\\task'" class="w-10 h-10" />
            <fwb-avatar v-if="chatStore.activeChat.type === 'app\\models\\company'" class="w-10 h-10"
                :img="chatStore.activeChat.avatar" />
            <EarthIcon v-if="chatStore.activeChat.type === 'app\\models\\event'" class="w-10 h-10" />
        </template>

        <router-link :to="makeLink()" class="text-xl flex-1 min-w-0">
            <h1 class="truncate">{{ chatStore.activeChat.title }}</h1>
        </router-link>

        <div class="flex items-center gap-2 ml-auto flex-shrink-0">
            <!-- Search toggle -->
            <fwb-button color="alternative" outline square @click="emit('toggleSearch')">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
            </fwb-button>

            <!-- Video call -->
            <fwb-button v-if="['user', 'group'].indexOf(chatStore.activeChat.type) > -1"
                color="dark" outline square @click="startCall">
                <PhoneIcon class="w-6 h-6" />
            </fwb-button>
        </div>

    </header>
</template>

<style scoped></style>
