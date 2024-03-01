<script setup lang="js">
import { computed } from "vue";
import { useLiveKit } from "../../../../functions/liveKit";
import { FwbButton } from "flowbite-vue";
import CameraIcon from "../../../shared/icons/CameraIcon.vue";
import CameraSlashIcon from "../../../shared/icons/CameraSlashIcon.vue";
const liveKit = useLiveKit();

const toggleCamera = async () => {
  liveKit.myDevicesState.isCameraEnabled =
    !liveKit.myDevicesState.isCameraEnabled;
  await liveKit.room?.localParticipant.setCameraEnabled(
    liveKit.myDevicesState.isCameraEnabled
  );
};

const myCamera = computed(() => {
  return liveKit.myDevicesState.isCameraEnabled;
});
</script>
<template>
    <fwb-button
        :key="myCamera.toString()"
        :color="myCamera ? 'default' : 'red'"
        pill
        square
        @click="toggleCamera"
    >
        <CameraIcon v-if="myCamera !== false" class="w-6 h-6" />
        <CameraSlashIcon v-if="myCamera === false" class="w-6 h-6" />
    </fwb-button>
</template>
