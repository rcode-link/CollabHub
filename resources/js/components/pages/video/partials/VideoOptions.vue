<template>
    <div class="absolute bottom-4 left-0 w-full flex justify-center z-10 px-4">
        <div class="flex items-end gap-1.5 rounded-2xl border border-white/10 bg-gray-900/85 px-5 py-3 shadow-2xl backdrop-blur-md">

            <!-- End call -->
            <div v-if="videoCall.size === 'fullScreen'" class="control-item">
                <EndCallOption />
                <span class="control-label">End</span>
            </div>

            <!-- Camera -->
            <div class="control-item">
                <ToggleCameraOption />
                <span class="control-label">Camera</span>
            </div>

            <!-- Microphone -->
            <div class="control-item">
                <ToggleMicrophoneOption />
                <span class="control-label">Mic</span>
            </div>

            <!-- Screen share -->
            <div v-if="videoCall.size === 'fullScreen'" class="control-item">
                <ToggleScreenShareOption />
                <span class="control-label">Share</span>
            </div>

            <!-- Device settings -->
            <div v-if="videoCall.size === 'fullScreen'" class="control-item">
                <DeviceSelector />
                <span class="control-label">Settings</span>
            </div>

            <!-- Divider -->
            <div class="mx-1 h-8 w-px self-center bg-white/10"></div>

            <!-- Expand / Minimize -->
            <div class="control-item">
                <MaxMinControl />
                <span class="control-label">{{ videoCall.size === 'fullScreen' ? 'Minimize' : 'Expand' }}</span>
            </div>

        </div>
    </div>
</template>

<script setup lang="js">
import { useVideoCallStore } from "@/store/videoCallStore";
const videoCall = useVideoCallStore();
import DeviceSelector from "./DeviceSelector.vue";
import MaxMinControl from "./MaxMinControl.vue";
import EndCallOption from "./EndCallOption.vue";
import ToggleCameraOption from "./ToggleCameraOption.vue";
import ToggleMicrophoneOption from "./ToggleMicrophoneOption.vue";
import ToggleScreenShareOption from "./ToggleScreenShareOption.vue";
</script>

<style scoped>
.control-item {
    @apply flex flex-col items-center gap-1;
}

.control-label {
    @apply text-[10px] text-gray-400 select-none;
}
</style>
