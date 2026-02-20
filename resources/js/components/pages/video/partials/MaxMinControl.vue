<script setup lang="js">
import MaximizeIcon from "@/components/shared/icons/ArrowsPointingOut.vue";
import MinimizeIcon from "@/components/shared/icons/ArrowsPointingIn.vue";
import { useVideoCallStore } from "@/store/videoCallStore";

const videoCall = useVideoCallStore();

const handleClick = () => {
    videoCall.size = videoCall.size !== 'fullScreen' ? 'fullScreen' : '';
};
</script>

<template>
    <button
        type="button"
        :title="videoCall.size === 'fullScreen' ? 'Minimize' : 'Expand to fullscreen'"
        @click="handleClick"
        class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 text-white shadow-md transition hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
    >
        <MaximizeIcon v-if="videoCall.size !== 'fullScreen'" class="h-5 w-5" />
        <MinimizeIcon v-else class="h-5 w-5" />
    </button>
</template>
