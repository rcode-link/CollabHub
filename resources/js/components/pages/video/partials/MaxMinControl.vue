<script setup lang="js">
import MaximizeIcon from "@/components/shared/icons/ArrowsPointingOut.vue";
import MinimizeIcon from "@/components/shared/icons/ArrowsPointingIn.vue";
import { useVideoCallStore } from "@/store/videoCallStore";
//@ts-ignore
import { FwbButton } from "flowbite-vue";
const videoCall = useVideoCallStore();

const handleClick = () => {
    videoCall.size = videoCall.size !== 'fullScreen' ? 'fullScreen' : '';
};
</script>
<template>
    <fwb-button color="alternative" pill square @click="handleClick">
        <MaximizeIcon v-if="videoCall.size !== 'fullScreen'" class="w-6 h-6" />
        <MinimizeIcon v-if="videoCall.size === 'fullScreen'" class="w-6 h-6" />
    </fwb-button>
</template>
