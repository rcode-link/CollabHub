<script setup lang="js">
import { computed } from "vue";
import { useLiveKit } from "@/functions/liveKit";
import CameraIcon from "@/components/shared/icons/CameraIcon.vue";
import CameraSlashIcon from "@/components/shared/icons/CameraSlashIcon.vue";

const liveKit = useLiveKit();

const toggleCamera = async () => {
    liveKit.myDevicesState.isCameraEnabled = !liveKit.myDevicesState.isCameraEnabled;
    await liveKit.room?.localParticipant.setCameraEnabled(liveKit.myDevicesState.isCameraEnabled);
};

const isCameraOn = computed(() => liveKit.myDevicesState.isCameraEnabled);
</script>

<template>
    <button
        type="button"
        :title="isCameraOn ? 'Turn off camera' : 'Turn on camera'"
        @click="toggleCamera"
        :class="[
            'flex h-10 w-10 items-center justify-center rounded-full shadow-md transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900',
            isCameraOn
                ? 'bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500'
                : 'bg-red-600 text-white hover:bg-red-500 focus:ring-red-500',
        ]"
    >
        <CameraIcon v-if="isCameraOn" class="h-5 w-5" />
        <CameraSlashIcon v-else class="h-5 w-5" />
    </button>
</template>
