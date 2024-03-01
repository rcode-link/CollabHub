<script setup lang="js">
import PhoneIcon from "../../../shared/icons/PhoneEndIcon.vue";
//@ts-ignore
import { FwbButton } from "flowbite-vue";
import { useLiveKit } from "../../../../functions/liveKit";
const liveKit = useLiveKit();
const endTheCall = async () => {
  await liveKit.room?.disconnect();
  window.location.href = "/";
};
</script>
<template>
    <fwb-button color="red" pill square @click="endTheCall">
        <PhoneIcon class="w-6 h-6" />
    </fwb-button>
</template>
