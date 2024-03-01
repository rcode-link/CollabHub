<script setup lang="ts">
//@ts-ignore
import { FwbButton, FwbBadge } from "flowbite-vue";
import MicrophoneSlashIcon from "../../shared/icons/MicrophoneSlashIcon.vue";
import { computed } from "vue";
import { Track } from "livekit-client";

const props = withDefaults(
    defineProps<{
        tracks: Track[];
        userImage?: string;
        enableAudio: boolean;
        name: string;
    }>(),
    {
        userImage:
            "https://imgs.search.brave.com/GrTMprW4fg05XTsfzacsNofnbaMJuXlbLIXZqUAn9vg/rs:fit:860:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAwLzY0LzY3LzI3/LzM2MF9GXzY0Njcy/NzM2X1U1a3BkR3M5/a2VVbGw4Q1JRM3Az/WWFFdjJNNnFrVlk1/LmpwZw",
    }
);
const filterTracks = computed(() => {
    if (!props.enableAudio) {
        return props.tracks.filter((obj) => obj.kind !== Track.Kind.Audio);
    }

    return props.tracks;
});

const isAudioMuted = computed(() => {
    const data = props.tracks.filter((obj) => obj.kind === Track.Kind.Audio);
    if (data.length) {
        return data[0].isMuted;
    }

    return true;
});

const isVideoDisabled = computed(() => {
    const data = props.tracks.filter((obj) => obj.kind === Track.Kind.Video);
    if (data.length) {
        return data[0].isMuted;
    }

    return true;
});
</script>
<template>
    <div class="flex-1 relative player">
        <template v-for="track in filterTracks" :key="track.sid">
            <component
                v-if="!track.isMuted"
                :is="track.kind"
                autoplay="true"
                class="w-full"
                playsInline="true"
                :srcObject="track.mediaStream"
            />
        </template>
        <div
            v-if="isVideoDisabled"
            class="bg-black flex h-full justify-center items-center"
        >
            <img :src="userImage" class="max-h-fit h-24" alt="" />
        </div>
        <fwb-button
            color="red"
            v-if="isAudioMuted"
            class="absolute right-1 bottom-1"
        >
            <MicrophoneSlashIcon class="w-4 h-4" />
        </fwb-button>
        <div class="username bg-white absolute bottom-1 left-1 px-2 rounded">
            {{ name }}
        </div>
    </div>
</template>
<style scoped>
.player {
    aspect-ratio: 16/9;
    max-height: 100%;
}
</style>
