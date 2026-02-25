<script setup lang="js">
import { useLiveKit } from "@/functions/liveKit";
import { useVideoCallStore } from '@/store/videoCallStore'
//@ts-ignore
import { reactive } from "vue";

//@ts-ignore
import VideoOptions from "@/components/pages/video/partials/VideoOptions.vue";
//@ts-ignore
import WelcomeScreen from "@/components/pages/video/partials/WelcomeScreen.vue";
//@ts-ignore
import PrintTracks from "@/components/pages/video/partials/PrintTracks.vue";
//@ts-ignore
import JoinRequests from "@/components/pages/video/partials/JoinRequests.vue";

const liveKit = useLiveKit();
const videoCall = useVideoCallStore();
const model = reactive({
    name: null,
    enableMicrophone: true,
    shareScreen: false,
    enableCamera: true,
    token: null,
});

const start = async (obj) => {
    model.name = obj.name;
    model.enableCamera = obj.enableCamera;
    model.enableMicrophone = obj.enableMicrophone;
    model.shareScreen = obj.shareScreen;
    if (!obj.token) return;
    model.token = obj.token;
    liveKit.token = obj.token;
    await liveKit.initRoom();
    await liveKit.startCall(model.enableMicrophone, model.enableCamera);
    await liveKit.loadDevices();
};
</script>

<template>
    <div :class="{
        'fixed z-50': true,
        'call-container top-0 left-0 bottom-0 right-0 bg-gray-900': videoCall.size === 'fullScreen',
        'w-72 h-20 bottom-4 right-4 shadow-2xl overflow-hidden rounded-xl bg-gray-900': videoCall.size !== 'fullScreen',
    }">
        <WelcomeScreen v-if="model.token === null" @update="start" />
        <div v-if="model.token" class="relative h-full">
            <PrintTracks :class="{
                'opacity-0 pointer-events-none': videoCall.size !== 'fullScreen',
            }" />
            <JoinRequests />
            <VideoOptions />
        </div>
    </div>
</template>
