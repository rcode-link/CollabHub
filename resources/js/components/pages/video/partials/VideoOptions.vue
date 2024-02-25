<template>
    <div
        :class="{
            'absolute z-10 bottom-5 left-0 w-full flex justify-center gap-4': true,
        }"
    >
        <EndCallOption />
        <ToggleCameraOption />
        <ToggleMicrophoneOption />
        <ToggleScreenShareOption />
        <DeviceSelector />
    </div>
</template>
<script setup lang="ts">
import DeviceSelector from "./DeviceSelector.vue";
import EndCallOption from "./EndCallOption.vue";
import ToggleCameraOption from "./ToggleCameraOption.vue";
import ToggleMicrophoneOption from "./ToggleMicrophoneOption.vue";
import ToggleScreenShareOption from "./ToggleScreenShareOption.vue";
</script>
