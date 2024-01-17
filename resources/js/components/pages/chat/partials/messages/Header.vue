<script setup>

import {FwbAvatar, FwbButton} from "flowbite-vue";
import {chatDetails} from "../../../../../store/chatStore.js";
import {useRoute} from "vue-router";
import PhoneIcon from "../../../../shared/icons/PhoneIcon.vue";

const chatStore = chatDetails()
const route = useRoute();


const startCall = () => {
  axios.post(`/api/v1/video-call/${route.params.chatId}/start`).then((res) => {
      window.open(`/call/${res.data.slug}`, '_blank');
  })
}

const makeLink = () => {
    if(['user', 'group'].indexOf(chatStore.activeChat.type) > -1){
        return `/user/${chatStore.activeChat.chatable_id}`
    }

    return  `/open/${chatStore.activeChat.item_key}`;
}
</script>

<template>
  <header class="shadow p-6 flex gap-4 items-center">
    <fwb-avatar :img="chatStore.activeChat.avatar" :key="chatStore.activeChat.avatar"/>
    <router-link tag="h1" :to="makeLink()" :class="`text-xl`">
      {{ chatStore.activeChat.title }}
    </router-link>
    <fwb-button v-if="['user', 'group'].indexOf(chatStore.activeChat.type) > -1"  color="dark" outline square class="ml-auto" @click="startCall">
      <PhoneIcon class="w-6 h-6" />
    </fwb-button>
  </header>
</template>

<style scoped>

</style>
