<template>
  <Teleport :to="`#message-${message.id}`">
    <div class="flex gap-2 absolute top-0 left-[50%] -translate-y-full -translate-x-1/2 p-2 bg-slate-600 text-white hover:text-slate-200 z-50 rounded-sm">
      <tippy
        content="Emoji"
        placement="top"
      >
        <Emoji @select="messageReaction" />
      </tippy>
      <tippy
        content="Reply to this message"
        placement="top"
      >
        <ArrowBackIcon
          class="w-4 h-4 cursor-pointer"
          @click="() => messagesState.setReplyToMessageId(message.id)"
        />
      </tippy>
      <tippy
        content="Delete Message"
        placement="top"
      >
        <TrashIcon
          class="w-4 h-4 cursor-pointer"
          @click="() => deleteMessageToast.showToastFn()"
        />
      </tippy>
    </div>
  </Teleport>

  <InteractiveToast ref="deleteMessageToast">
    <template #content>
      Are you sure you want to delete this message?
    </template>
    <template #actions>
      <fwb-button
        size="xs"
        @click="deleteMessage"
      >
        Yes, Delete it!
      </fwb-button>
    </template>
  </InteractiveToast>
</template>
<script setup>
import { FwbButton } from "flowbite-vue";
import InteractiveToast from "../../../../shared/InteractiveToast.vue";
import { chatDetails } from "../../../../../store/chatStore.js";
import { onMounted, ref, computed, onUnmounted } from "vue";
import { Tippy } from "vue-tippy";
import Emoji from "../../../../shared/Emoji.vue";
import ArrowBackIcon from "../../../../shared/icons/ArrowBackIcon.vue";
import TrashIcon from "../../../../shared/icons/TrashIcon.vue";
import EclipsisVerticalIcon from "../../../../shared/icons/EclipsisVerticalIcon.vue";

const messagesState = chatDetails();
const deleteMessageToast = ref(null);
const message = computed(() => {
  return messagesState.messages.find(
    (obj) => obj.id == messagesState.selectedMessage
  );
});

const messageReaction = (emoji) => {
  deleteMessageToast.value.hideToast();
  axios.post("/api/v1/messages/reactions", {
    reaction: emoji.i,
    chat_message_id: message.value.id,
  });
};

const deleteMessage = () => {
  axios.delete(`/api/v1/messages/${message.value.id}`);
};
</script>
