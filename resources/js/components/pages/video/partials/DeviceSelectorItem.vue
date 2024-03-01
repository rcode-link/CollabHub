<script lang="js" setup>
import { useLiveKit, iMediaDeviceInfo } from "../../../../functions/liveKit";
//@ts-ignore
import { FwbListGroupItem } from "flowbite-vue";
const props = defineProps<{
  type: "videoinput" | "audioinput";
  device: iMediaDeviceInfo;
}>();
const liveKit = useLiveKit();
const changeItem = async () => {
  await liveKit.switchDevice(props.type, props.device.deviceId);
};
</script>
<template>
    <fwb-list-group-item class="cursor-pointer" @click="changeItem">
        <span v-if="device.active">&#10003;</span> {{ device.label }}
    </fwb-list-group-item>
</template>
