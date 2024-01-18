<script setup lang="ts">
import { useLiveKit } from "../../../../functions/liveKit";
import { FwbButton } from "flowbite-vue";
import DispleyIcon from "../../../shared/icons/DispleyIcon.vue";
const liveKit = useLiveKit();
const toggleScreenShare = async () => {
  await liveKit.room?.localParticipant.setScreenShareEnabled(
    liveKit.videoShareTrack.length === 0 ? true : false
  );
};
</script>
<template>
  <fwb-button
    :key="liveKit.videoShareTrack.length"
    :color="liveKit.videoShareTrack.length ? 'red' : 'default'"
    pill
    square
    @click="toggleScreenShare"
  >
    <DispleyIcon class="w-6 h-6" />
  </fwb-button>
</template>