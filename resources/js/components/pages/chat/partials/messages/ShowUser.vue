<script setup>
import { FwbAvatar, FwbP } from "flowbite-vue";
import { computed } from "vue";
import { chatDetails } from "@/store/chatStore.js";
import { DateTime } from "luxon";
const props = defineProps({
    index: null,
});
const chatStore = chatDetails();

const showUser = computed(() => {
    if (props.index - 1 === 0) {
        return true;
    }

    const prevDate = DateTime.fromISO(
        chatStore.messages[props.index - 2].createdAt
    ).toLocaleString(DateTime.DATE_SHORT);

    if (
        prevDate !=
        DateTime.fromISO(
            chatStore.messages[props.index - 1].createdAt
        ).toLocaleString(DateTime.DATE_SHORT)
    ) {
        return true;
    }

    if (
        chatStore.messages[props.index - 1].user.id !=
        chatStore.messages[props.index - 2].user.id
    ) {
        return true;
    }
    return false;
});
const message = computed(() => {
    return chatStore.messages[props.index - 1];
});
</script>
<template>
    <router-link
        v-if="showUser"
        :to="`/user/${message.user.id}`"
        :class="{ 'mb-1 mt-2 ml-4 flex gap-1 items-center': true }"
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
</template>
