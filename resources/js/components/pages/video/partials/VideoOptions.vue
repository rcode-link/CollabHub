<template>
    <div :class="{
        'absolute z-10 bottom-5 left-0 w-full flex justify-center gap-4': true,
    }">
        <EndCallOption v-if="videoCall.size === 'fullScreen'" />
        <ToggleCameraOption />
        <ToggleMicrophoneOption />
        <ToggleScreenShareOption v-if="videoCall.size === 'fullScreen'" />
        <DeviceSelector v-if="videoCall.size === 'fullScreen'" />
        <MaxMinControl />
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
