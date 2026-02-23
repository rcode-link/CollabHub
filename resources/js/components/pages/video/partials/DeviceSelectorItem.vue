<script lang="ts" setup>
import { useLiveKit, iMediaDeviceInfo } from "@/functions/liveKit";

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
    <button
        type="button"
        @click="changeItem"
        class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-200 transition hover:bg-gray-700 focus:outline-none"
    >
        <span
            :class="[
                'h-4 w-4 flex-shrink-0 rounded-full border-2 transition',
                device.active ? 'border-blue-400 bg-blue-400' : 'border-gray-500 bg-transparent',
            ]"
        ></span>
        <span class="truncate">{{ device.label }}</span>
    </button>
</template>
