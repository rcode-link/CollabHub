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

            <!-- Copy link -->
            <div v-if="videoCall.size === 'fullScreen'" class="control-item">
                <button
                    type="button"
                    @click="copyLink"
                    class="flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/10"
                    title="Copy call link"
                >
                    <svg v-if="!copied" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" />
                    </svg>
                    <svg v-else class="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </button>
                <span class="control-label">{{ copied ? 'Copied!' : 'Link' }}</span>
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
import { ref } from "vue";
import { useVideoCallStore } from "@/store/videoCallStore";
const videoCall = useVideoCallStore();
import DeviceSelector from "@/components/pages/video/partials/DeviceSelector.vue";
import MaxMinControl from "@/components/pages/video/partials/MaxMinControl.vue";
import EndCallOption from "@/components/pages/video/partials/EndCallOption.vue";
import ToggleCameraOption from "@/components/pages/video/partials/ToggleCameraOption.vue";
import ToggleMicrophoneOption from "@/components/pages/video/partials/ToggleMicrophoneOption.vue";
import ToggleScreenShareOption from "@/components/pages/video/partials/ToggleScreenShareOption.vue";

const copied = ref(false);
const copyLink = async () => {
    const url = `${window.location.origin}/call/${videoCall.videoId}`;
    await navigator.clipboard.writeText(url);
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 2000);
};
</script>

<style scoped>
.control-item {
    @apply flex flex-col items-center gap-1;
}

.control-label {
    @apply text-[10px] text-gray-400 select-none;
}
</style>
