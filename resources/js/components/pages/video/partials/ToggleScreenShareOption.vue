<script setup lang="js">
import { useLiveKit } from "@/functions/liveKit";
import DispleyIcon from "@/components/shared/icons/DispleyIcon.vue";

const liveKit = useLiveKit();

const toggleScreenShare = async () => {
    try {
        await liveKit.room?.localParticipant.setScreenShareEnabled(
            liveKit.videoShareTrack.length === 0
        );
    } catch (e) {
        console.error('Screen share failed:', e);
    }
};
</script>

<template>
    <button
        type="button"
        :title="liveKit.videoShareTrack.length ? 'Stop sharing' : 'Share screen'"
        @click="toggleScreenShare"
        :class="[
            'flex h-10 w-10 items-center justify-center rounded-full shadow-md transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900',
            liveKit.videoShareTrack.length
                ? 'bg-blue-600 text-white hover:bg-blue-500 focus:ring-blue-500'
                : 'bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500',
        ]"
    >
        <DispleyIcon class="h-5 w-5" />
    </button>
</template>
