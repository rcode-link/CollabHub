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
//@ts-ignore
import DeviceSelector from "./DeviceSelector.vue";
//@ts-ignore
import EndCallOption from "./EndCallOption.vue";
//@ts-ignore
import ToggleCameraOption from "./ToggleCameraOption.vue";
//@ts-ignore
import ToggleMicrophoneOption from "./ToggleMicrophoneOption.vue";
//@ts-ignore
import ToggleScreenShareOption from "./ToggleScreenShareOption.vue";
</script>
