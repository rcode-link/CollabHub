<script setup>
import { FwbAvatar, FwbP } from "flowbite-vue";
import { useUserStore } from "../../../../../store/user.js";
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import PrintChatMessage from "./PrintChatMessage.vue";

const user = useUserStore();
const router = useRouter();
const route = useRoute();
const messageContainer = ref(null);
const props = defineProps({
  message: {},
  hideUser: false,
});

function handleFocusOnMessage() {
  if (route.hash === `#message-${props.message.id}`) {
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
  <div ref="messageContainer" class="flex flex-col mx-4 mt-2">
    <router-link
      v-if="!hideUser"
      :to="`/user/${message.user.id}`"
      :class="{ 'mb-1 flex gap-1 items-center': true }"
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

