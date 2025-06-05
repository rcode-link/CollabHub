<script setup>
import { FwbAvatar, FwbP } from "flowbite-vue";
import { useUserStore } from "@/store/user";
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import PrintChatMessage from "./PrintChatMessage.vue";
import { chatDetails } from "@/store/chatStore.js";
import { DateTime } from "luxon";
import { onClickOutside } from "@vueuse/core";
import { useTemplateRef } from "vue";

const chatStore = chatDetails();
const user = useUserStore();
const router = useRouter();
const route = useRoute();
const props = defineProps({
    index: null,
    message: null,
});
</script>

<template>
    <div class="flex flex-col mx-4 relative">
        <PrintChatMessage :message="message" @mouseenter="() => { chatStore.setSelectedMessage(message.id); }"
            @mouseleave="() => { chatStore.setSelectedMessage(null); }" />


    </div>
</template>
