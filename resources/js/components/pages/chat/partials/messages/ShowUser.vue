<script setup>
import { FwbAvatar, FwbP } from "flowbite-vue";
import { computed } from "vue";
import { chatDetails } from "@/store/chatStore.js";
const { user, messageId } = defineProps({
  user: null,
  messageId: null,
});
const chatStore = chatDetails();

const showUser = computed(() => {
  const prevMessage = chatStore.messages.findIndex(
    (obj) => (obj.id == messageId)
  );

    console.log(messageId, prevMessage);
    // if the message index is zero that means its first message in the list
  if (prevMessage === 0) {
    return true;
  }


  return user.id !== chatStore.messages[prevMessage - 1].user.id;
});
</script>
<template>
  <router-link
    v-if="showUser"
    :to="`/user/${user.id}`"
    :class="{ 'mb-1 mt-2 ml-4 flex gap-1 items-center': true }"
  >
    <fwb-avatar :img="user.avatar" />
    <fwb-p class="font-bold">
      <div>
        {{ user.name }}
      </div>
      <div class="text-xs mb-auto">
        {{ user.email }}
      </div>
    </fwb-p>
  </router-link>
</template>
