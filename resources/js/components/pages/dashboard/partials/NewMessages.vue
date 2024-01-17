<script setup>

import Card from "../../../shared/Card.vue";
import {ref} from "vue";
import ChatUsersItem from "../../chat/partials/ChatUsersItem.vue";
import {FwbAlert} from "flowbite-vue";

const messages = ref([]);
const loadNumberOfUnreadMessages = () => {
    window.axios.get('/api/v1/dashboard/messages').then(res => {
        messages.value = res.data.data;
    });
}

loadNumberOfUnreadMessages();
</script>

<template>
    <Card class="flex-col">
        <ul v-for="obj in messages" :key="obj.id">
            <ChatUsersItem :obj="obj"/>
        </ul>
        <template v-if="messages.length === 0">
            <fwb-alert type="info" >
                <h1>No new messages</h1>
            </fwb-alert>
        </template>
    </Card>
</template>

<style scoped>

</style>
