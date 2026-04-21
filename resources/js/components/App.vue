<template>
  <div id="print" class="tiptap ProseMirror printOnly"></div>
  <router-view></router-view>
  <div id="append-container"></div>
  <VideoCall v-if="videoStore.videoId && route.name !== 'video-call'" />
</template>
<script setup lang="js">

import { useRoute } from 'vue-router'
import { onMounted, watch, defineAsyncComponent } from "vue";
import useInit from "@/functions/useInit.js";
import { useUserStore } from '@/store/user.js';
const userStore = useUserStore();
import { useVideoCallStore } from '@/store/videoCallStore'

const VideoCall = defineAsyncComponent(()=>import('@/components/pages/video/Index.vue') );
userStore.initTitleTracking();

const route = useRoute()

const videoStore = useVideoCallStore();

watch(() => route.query.callId, () => {
    if (!route.query.callId) {
        return;
    }
    videoStore.setToken(route.query.callId);
}, {
    immediate: true
});

// Also handle /call/:slug route (used by VideoToast and calendar links opening in new tabs)
watch(() => route.params.slug, () => {
    if (route.name === 'video-call' && route.params.slug) {
        videoStore.setToken(route.params.slug);
    }
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
