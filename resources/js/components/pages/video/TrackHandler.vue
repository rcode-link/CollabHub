<script setup lang="ts">

import {FwbButton} from "flowbite-vue";
import MicrophoneSlashIcon from "../../shared/icons/MicrophoneSlashIcon.vue";
import {computed} from "vue";
import {Track} from "livekit-client";

const props = defineProps<{
    tracks: Track[],
    userImage?: string,
    enableAudio: boolean
}>();
const filterTracks = computed(() => {

    if (!props.enableAudio) {
        return props.tracks.filter(obj => obj.kind !== Track.Kind.Audio);
    }

    return props.tracks;
});

const isAudioMuted = computed(() => {
    const data = props.tracks.filter(obj => obj.kind === Track.Kind.Audio);
    if (data.length) {
        return data[0].isMuted;
    }

    return true;
})

const isVideoDisabled = computed(() => {
    const data = props.tracks.filter(obj => obj.kind === Track.Kind.Video);
    if (data.length) {
        return data[0].isMuted;
    }

    return true;
})

</script>
<template>
    <div class="flex-1 relative player">
        <template v-for="(track) in filterTracks" :key="track.sid">
            <transition>
                <component
                    v-if="!track.isMuted"
                    :is="track.kind"
                    autoplay="true"
                    class="w-full"
                    playsInline="true"
                    :srcObject="track.mediaStream"/>
            </transition>
        </template>
        <div
            v-if="isVideoDisabled"
            class="bg-black flex h-full justify-center items-center"
        >
            <img :src="userImage" class="max-h-fit h-24" alt="">
        </div>
        <fwb-button color="red"
                    v-if="isAudioMuted"
                    class="absolute right-1 bottom-1">
            <MicrophoneSlashIcon class="w-4 h-4"/>
        </fwb-button>
    </div>
</template>
<style scoped>
.player {
    aspect-ratio: 16/9;
    max-height: 50vh;
}
.v-enter-active,
.v-leave-active {
    transition: all 5s ease;
}

.v-enter-from,
.v-leave-to {
    width: 0px;
}
</style>
