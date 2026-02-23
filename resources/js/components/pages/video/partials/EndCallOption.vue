<script setup lang="js">
import PhoneIcon from "@/components/shared/icons/PhoneEndIcon.vue";
import { useLiveKit } from "@/functions/liveKit";
const liveKit = useLiveKit();
const endTheCall = async () => {
    await liveKit.room?.disconnect();
    window.location.href = "/";
};
</script>

<template>
    <button
        type="button"
        title="End call"
        @click="endTheCall"
        class="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white shadow-md transition hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
    >
        <PhoneIcon class="h-5 w-5" />
    </button>
</template>
