<script setup lang="js">
import { computed } from "vue";
import { useLiveKit } from "../../../../functions/liveKit";
import MicrophoneIcon from "../../../shared/icons/MicrophoneIcon.vue";
import MicrophoneSlashIcon from "../../../shared/icons/MicrophoneSlashIcon.vue";

const liveKit = useLiveKit();

const toggleMicrophone = async () => {
    liveKit.myDevicesState.isMicrophoneEnabled = !liveKit.myDevicesState.isMicrophoneEnabled;
    await liveKit.room?.localParticipant.setMicrophoneEnabled(liveKit.myDevicesState.isMicrophoneEnabled);
};

const isMicOn = computed(() => liveKit.myDevicesState.isMicrophoneEnabled);
</script>

<template>
    <button
        type="button"
        :title="isMicOn ? 'Mute microphone' : 'Unmute microphone'"
        @click="toggleMicrophone"
        :class="[
            'flex h-10 w-10 items-center justify-center rounded-full shadow-md transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900',
            isMicOn
                ? 'bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500'
                : 'bg-red-600 text-white hover:bg-red-500 focus:ring-red-500',
        ]"
    >
        <MicrophoneIcon v-if="isMicOn" class="h-5 w-5" />
        <MicrophoneSlashIcon v-else class="h-5 w-5" />
    </button>
</template>
