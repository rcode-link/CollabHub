<template>
    <div id="print" class="tiptap ProseMirror printOnly"></div>
    <router-view></router-view>
    <div id="append-container"></div>
    <VideoCall v-if="videoStore.videoId" />
</template>
<script setup lang="js">

import { useRoute } from 'vue-router'
import { onMounted, watch } from "vue";
import useInit from "../functions/useInit.js";
import { useUserStore } from '../store/user.js';
const userStore = useUserStore();
import { useVideoCallStore } from '@/store/videoCallStore'

import VideoCall from '@/components/pages/video/Index.vue'
userStore.initTitleTracking();

const route = useRoute()

const videoStore = useVideoCallStore();

watch(() => route.query.callId, (oldValue, newValue) => {
    if (!route.query.callId) {
        return;
    }
    videoStore.setToken(route.query.callId);
}, {
    immediate: true
});


onMounted(() => {
    useInit();
});
</script>

<style>
@media print {
    .printOnly {
        display: block;
    }
}

@media screen {
    .printOnly {
        display: none;
    }
}
</style>
