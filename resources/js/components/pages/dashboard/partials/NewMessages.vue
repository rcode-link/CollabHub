<script setup>

import { FwbCard, FwbAlert } from "flowbite-vue";
import { ref } from "vue";
import ChatUsersItem from "../../chat/partials/ChatUsersItem.vue";

const messages = ref([]);
const loadNumberOfUnreadMessages = () => {
    window.axios.get('/api/v1/dashboard/messages').then(res => {
        messages.value = res.data.data;
    });
}

loadNumberOfUnreadMessages();
</script>

<template>
    <FwbCard class="flex flex-col h-full !max-w-none w-full p-5">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-4">Recent Messages</h3>
        <ul v-for="obj in messages" :key="obj.id">
            <ChatUsersItem :obj="obj"/>
        </ul>
        <template v-if="messages.length === 0">
            <fwb-alert type="info">
                <span>No new messages</span>
            </fwb-alert>
        </template>
    </FwbCard>
</template>

<style scoped></style>
