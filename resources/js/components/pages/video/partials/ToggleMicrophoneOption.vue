<script setup lang="ts">
import { computed } from "vue";
import { useLiveKit } from "../../../../functions/liveKit";
import { FwbButton } from "flowbite-vue";
import MicrophoneIcon from "../../../shared/icons/MicrophoneIcon.vue";
import MicrophoneSlashIcon from "../../../shared/icons/MicrophoneSlashIcon.vue";
const liveKit = useLiveKit();

const toggleMicrophone = async () => {
  liveKit.myDevicesState.isMicrophoneEnabled =
    !liveKit.myDevicesState.isMicrophoneEnabled;
  await liveKit.room?.localParticipant.setMicrophoneEnabled(
    liveKit.myDevicesState.isMicrophoneEnabled
  );
};

const myMirophone = computed(() => {
  return liveKit.myDevicesState.isMicrophoneEnabled;
});
</script>
<template>
  <fwb-button
    :key="myMirophone.toString()"
    :color="myMirophone === false ? 'red' : 'default'"
    pill
    square
    @click="toggleMicrophone"
  >
    <MicrophoneIcon v-if="myMirophone !== false" class="w-6 h-6" />
    <MicrophoneSlashIcon v-if="myMirophone === false" class="w-6 h-6" />
  </fwb-button>
</template>