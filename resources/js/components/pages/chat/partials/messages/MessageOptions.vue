<template>
    <tippy tag="div" content-tag="div"
           trigger="click"
           interactive
           placement="top"
           content-class="flex gap-2">
        <template #default>
            <div class="p-2">
                <EclipsisVerticalIcon class="w-4 h-4"/>
            </div>
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
<script setup lang="ts">
import {FwbButton} from "flowbite-vue";
import InteractiveToast from "../../../../shared/InteractiveToast.vue";
import {chatDetails} from "../../../../../store/chatStore.js";
import {ref} from "vue";
import {Tippy} from "vue-tippy";
import Emoji from "../../../../shared/Emoji.vue";
import ArrowBackIcon from "../../../../shared/icons/ArrowBackIcon.vue";
import TrashIcon from "../../../../shared/icons/TrashIcon.vue";
import EclipsisVerticalIcon from "../../../../shared/icons/EclipsisVerticalIcon.vue";

const messagesState = chatDetails();
const deleteMessageToast = ref(null);

const props = defineProps({
    message: {}
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
