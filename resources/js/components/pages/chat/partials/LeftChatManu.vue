<script setup>

import {useAbility} from "@casl/vue";
import {onMounted, ref, watch} from "vue";
import {useUserStore} from "../../../../store/user.js";
import Card from "../../../shared/Card.vue";
import {useRoute, useRouter} from "vue-router";
import {chatDetails} from "../../../../store/chatStore.js";
import ChatUsersItem from "./ChatUsersItem.vue";
import CreateChat from "./CreateChat.vue";
import UsersListHeader from "./UsersListHeader.vue";
import {FwbButton} from "flowbite-vue";
import PlusSquare from "../../../shared/icons/PlusSquare.vue";

const chatState = chatDetails();
const {can, rules} = useAbility()

const route = useRoute();
const router = useRouter();
const userState = useUserStore();

const createTaskModal = ref(null)
const load = () => {
  if (userState.company.id) {
    axios.get(`/api/v1/chats?type=${route.query.type}`).then(res => {
      chatState.setChatList(res.data.data)
    });
  }
}


watch(() => userState.company, () => {
  load();
}, {
  immediate: true,
  deep: true
})
watch(() => route.query.type, (value, oldValue, onCleanup) => {
  if (value !== oldValue) {
    load();
  }
}, {
  deep: true
})

onMounted(() => {
  Echo.private('UpdateChatForUser.' + userState.user.id)
      .listen('ChatUpdate', (data) => {
        // chatState.setChatOnTopOfTheList(data.id);
        chatState.updateChatListMessage(data);
      });
})
const showModal = () => {
  console.log(createTaskModal.value);
  createTaskModal.value.modal.toggleModal();
}
</script>

<template>
  <div>
    <UsersListHeader>
      <fwb-button color="dark" outline square @click="showModal">
        <PlusSquare class="w-6 h-6 "/>
      </fwb-button>
    </UsersListHeader>
    <Card class="flex-col mt-2">
      <ul class="divide-y divide-gray-200 dark:divide-gray-700">

        <li v-for="obj in chatState.chatList" :key="obj.id + userState.onlineUsers">
          <ChatUsersItem :obj="obj"/>
        </li>
      </ul>
    </Card>
  </div>
  <CreateChat ref="createTaskModal" @update="load" class="ml-auto"/>
</template>

