<script setup>

import {FwbAvatar, FwbButton, FwbP,} from "flowbite-vue";
import {useUserStore} from "../../../../../store/user.js";
import {ref, watch} from "vue";
import {chatDetails} from "../../../../../store/chatStore.js";
import {useRoute, useRouter} from "vue-router";
import {Tippy} from "vue-tippy";
import Emoji from "../../../../shared/Emoji.vue";
import PrintChatMessage from "./PrintChatMessage.vue";
import InteractiveToast from "../../../../shared/InteractiveToast.vue";
import ArrowBackIcon from "../../../../shared/icons/ArrowBackIcon.vue";
import TrashIcon from "../../../../shared/icons/TrashIcon.vue";

const user = useUserStore();
const messagesState = chatDetails();
const router = useRouter();
const route = useRoute();
const deleteMessageToast = ref(null);
const messageContainer = ref(null);
const props = defineProps({
    message: {},
    hideUser: false,
})


function handleFocusOnMessage() {
    if (route.hash === `#message-${props.message.id}`) {
        messageContainer.value?.scrollIntoView();
    }
}

watch(() => route.hash, () => {
    handleFocusOnMessage();
}, {
    deep: true,
    immediate: true
})


const messageReaction = (emoji) => {
    deleteMessageToast.value.hideToast();
    axios.post('/api/v1/messages/reactions', {
        reaction: emoji.i,
        chat_message_id: props.message.id,
    })
}

const deleteMessage = () => {
    axios.delete(`/api/v1/messages/${props.message.id}`)
}
</script>

<template>
    <div ref="messageContainer" class="flex flex-col mx-4 mt-2">
        <div v-if="!hideUser"
             :class="{'mb-1 flex gap-1 items-center': true}">
            <fwb-avatar :img="message.user.avatar"/>
            <fwb-p class="font-bold">
                <div>
                    {{ message.user.name }}
                </div>
                <div class="text-xs mb-auto">
                    {{ message.user.email }}
                </div>
            </fwb-p>
        </div>
        <template v-if="!message.videocall">

        <tippy tag="div" content-tag="div"
               trigger="click"
               interactive
               placement="top"
               content-class="flex gap-2">
            <template #default>
                <PrintChatMessage :message="message"/>
            </template>
            <template #content>
                <div class="flex gap-2">
                    <tippy content="Emoji" placement="top">
                        <Emoji @select="messageReaction"/>
                    </tippy>
                    <tippy content="Reply to this message" placement="top">
                        <ArrowBackIcon class="w-4 h-4 cursor-pointer"
                                       @click="() => messagesState.setReplyToMessageId(message.id)"/>
                    </tippy>
                    <tippy content="Delete Message" placement="top">
                        <TrashIcon class="w-4 h-4 cursor-pointer"
                                   @click="() => deleteMessageToast.showToastFn()"/>
                    </tippy>
                </div>
            </template>
        </tippy>
        </template>
        <template v-else>
            <PrintChatMessage :message="message"/>
        </template>
    </div>

    <InteractiveToast ref="deleteMessageToast">
        <template #content>
            Are you sure you want to delete this message?
        </template>
        <template #actions>
            <fwb-button size="xs" @click="deleteMessage">
                Yes, Delete it!
            </fwb-button>
        </template>
    </InteractiveToast>
</template>

