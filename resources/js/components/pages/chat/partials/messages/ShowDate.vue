<script setup>
import { FwbBadge, FwbCard } from "flowbite-vue";
import { chatDetails } from "@/store/chatStore.js";
import { DateTime } from "luxon";
import { computed } from "vue";

const chatStore = chatDetails();

const props = defineProps({
    index: null,
});
const shouldBeShown = computed(() => {
    if (props.index === 0) {
        return true;
    }

    const prevDate = DateTime.fromISO(
        chatStore.messages[props.index - 1].createdAt
    ).toLocaleString(DateTime.DATE_SHORT);

    if (
        prevDate !=
        DateTime.fromISO(
            chatStore.messages[props.index].createdAt
        ).toLocaleString(DateTime.DATE_SHORT)
    ) {
        return true;
    }
    return false;
});
</script>

<template>
    <div
        v-if="shouldBeShown"
        class="sticky top-0 w-full bg-gray-100 dark:bg-gray-900 text-center z-10 date-for-easeir-search"
    >
        {{
            DateTime.fromISO(
                chatStore.messages[index].createdAt
            ).toLocaleString(DateTime.DATE_SHORT)
        }}
    </div>
</template>

<style scoped></style>
