<template>
  <router-view></router-view>
  <CreateTaskForm />
  <InteractiveToast ref="toastRef">
    <template #title> You have a call </template>
    <template #content> {{ call.user.name }} is calling you. </template>
    <template #actions>
      <router-link
        :to="{
          name: 'video-call',
          params: {
            slug: call.videocalls.slug,
          },
        }"
        target="_blank"
        :class="{ 'flex  w-full': true }"
      >
        <fwb-badge
          type="default"
          class="flex justify-start w-full gap-2 py-2 px-4"
        >
          <PhoneIcon class="w-4 h-4" />
          Answer
        </fwb-badge>
      </router-link>
    </template>
  </InteractiveToast>
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import useInit from "../functions/useInit.js";
import { useUserStore } from "../store/user";
import { chatDetails } from "../store/chatStore.js";
import CreateTaskForm from "./pages/project/tasks/Form.vue";
import "./declaration";
import InteractiveToast from "./shared/InteractiveToast.vue";
import PhoneIcon from "./shared/icons/PhoneIcon.vue";
import { FwbBadge } from "flowbite-vue";
import { useRouter } from "vue-router";

const toastRef = ref<typeof InteractiveToast | null>(null);
const router = useRouter();
const call = ref();
onMounted(() => {
  useInit();
});

const userState = useUserStore();
const messagesState = chatDetails();
watch(
  () => userState.user.id,
  () => {
    if (!userState.user.id) {
      return;
    }
    loadNumberOfUnreadMessages();

    window.Echo.private(`start-call.${userState.user.id}`).listen(
      "StartVideoCall",
      (data: any) => {
        console.log(data);
        call.value = data.callId;
        toastRef.value?.showToastFn();
        if (!document.hasFocus()) {
          const notification = new Notification("Video call", {
            body: `${data.callId.user.name} is calling you.`,
          });

          notification.onclick = (e) => {
            e.preventDefault();
            window.open(`/call/${data.callId.videocalls.slug}`);
          };
        }
      }
    );

    window.Echo.private("UpdateChatForUser." + userState.user.id).listen(
      "ChatUpdate",
      (data) => {
        loadNumberOfUnreadMessages();
        if (!document.hasFocus()) {
          const notification = new Notification("New message", {
            body: `${data.message.user} send you new message`,
          });
          notification.onclick = () => {
            router.push({
              name: "chat-details",
              params: {
                chatId: data.chatId,
              },
            });
          };
        }
      }
    );
  },
  {
    immediate: true,
    deep: true,
  }
);

const loadNumberOfUnreadMessages = () => {
  window.axios.get("/api/v1/chats/number-of-unread-messages").then((res) => {
    userState.setNewMessages(res.data);
    res.data.messages.forEach((data) => {
      messagesState.updateUnreadMessages(data);
    });
  });
};
</script>
