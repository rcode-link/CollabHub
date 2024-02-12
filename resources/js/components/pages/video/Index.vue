<script setup lang="ts">
import { useLiveKit, LocalParticipantModel } from "../../../functions/liveKit";
//@ts-ignore
import { reactive } from "vue";

//@ts-ignore
import VideoOptions from "./partials/VideoOptions.vue";
//@ts-ignore
import WelcomeScreen from "./partials/WelcomeScreen.vue";
//@ts-ignore
import PrintTracks from "./partials/PrintTracks.vue";

const liveKit = useLiveKit();
const model = reactive<LocalParticipantModel>({
    name: null,
    enableMicrophone: true,
    shareScreen: false,
    enableCamera: true,
    token: null,
});

const start = async (obj: LocalParticipantModel) => {
    model.name = obj.name;
    model.enableCamera = obj.enableCamera;
    model.enableMicrophone = obj.enableMicrophone;
    model.shareScreen = obj.shareScreen;
    if (!obj.token) {
        return;
    }
    model.token = obj.token;
    liveKit.token = obj.token;
    await liveKit.initRoom();
    await liveKit.startCall(model.enableMicrophone, model.enableCamera);
    await liveKit.loadDevices();
};
</script>

<template>
    <WelcomeScreen v-if="model.token === null" @update="start" />
    <div
        v-if="model.token"
        :class="{
            'fixed call-container bg-gray-100 dark:bg-gray-900 z-50': true,
            'top-0 left-0 bottom-0 right-0': true,
        }"
    >
        <VideoOptions />
        <PrintTracks />
    </div>
</template>
<style scoped>
.grid {
    @apply flex flex-wrap justify-center h-screen items-center gap-1;
}

.screen-share {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    @apply justify-center h-screen items-center gap-1;
}

.calls-enter-active,
.calls-leave-active {
    opacity: 1;
    transition: all 0.1s ease;
}

.calls-enter-from,
.calls-leave-to {
    opacity: 0;
}

.calls-leave-active {
    position: absolute;
}
</style>
