<script setup>
import { FwbAvatar, FwbButton } from "flowbite-vue";
import { chatDetails } from "../../../../../store/chatStore.js";
import { useRoute, useRouter } from "vue-router";
import PhoneIcon from "../../../../shared/icons/PhoneIcon.vue";
import UserIcon from "../../../../shared/UserIcon.vue";
import Task from "../../../../shared/icons/Task.vue";
import EarthIcon from "../../../../shared/icons/EarthIcon.vue";

const chatStore = chatDetails();
const route = useRoute();

const router = useRouter();

const startCall = () => {
    axios.post(`/api/v1/video-call/${route.params.chatId}/start`).then((res) => {
        router.push(`/call/${res.data.slug}`);
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
    <header class="shadow py-6 px-4 flex gap-4 items-center">
        <UserIcon v-if="['user', 'group'].indexOf(chatStore.activeChat.type) > -1" :user="chatStore.activeChat"
            class="min-w-10 w-10 h-10 rounded" />
        <template v-else>
            <Task v-if="chatStore.activeChat.type === 'app\\models\\task'" class="w-10 h-10" />
            <fwb-avatar v-if="chatStore.activeChat.type === 'app\\models\\company'" class="w-10 h-10"
                :img="chatStore.activeChat.avatar" />
            <EarthIcon v-if="chatStore.activeChat.type === 'app\\models\\event'" class="w-10 h-10" />
        </template>

        <router-link :to="makeLink()" :class="`text-xl`">
            <h1>{{ chatStore.activeChat.title }}</h1>
        </router-link>
        <fwb-button v-if="['user', 'group'].indexOf(chatStore.activeChat.type) > -1" color="dark" outline square
            class="ml-auto" @click="startCall">
            <PhoneIcon class="w-6 h-6" />
        </fwb-button>
    </header>
</template>

<style scoped></style>
