<script setup lang="ts">
import MicrophoneSlashIcon from "@/components/shared/icons/MicrophoneSlashIcon.vue";
import { computed } from "vue";
import { Track } from "livekit-client";

const props = defineProps<{
    tracks: Track[];
    enableAudio: boolean;
    name: string;
}>();

const filterTracks = computed(() => {
    if (!props.enableAudio) {
        return props.tracks.filter((obj) => obj.kind !== Track.Kind.Audio);
    }
    return props.tracks;
});

const isAudioMuted = computed(() => {
    const data = props.tracks.filter((obj) => obj.kind === Track.Kind.Audio);
    if (data.length) return data[0].isMuted;
    return true;
});

const isVideoDisabled = computed(() => {
    const data = props.tracks.filter((obj) => obj.kind === Track.Kind.Video);
    if (data.length) return data[0].isMuted;
    return true;
});

const initials = computed(() => {
    return (props.name ?? '?')
        .split(' ')
        .map((w: string) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
});
</script>

<template>
    <div class="relative overflow-hidden rounded-2xl bg-gray-800 player">
        <!-- Active video tracks -->
        <template v-for="track in filterTracks" :key="track.sid">
            <component
                v-if="!track.isMuted"
                :is="track.kind"
                autoplay="true"
                playsInline="true"
                class="h-full w-full object-cover"
                :srcObject="track.mediaStream"
            />
        </template>

        <!-- Camera off: show initials avatar -->
        <div v-if="isVideoDisabled" class="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div
                class="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-blue-600 text-lg font-bold text-white select-none shadow-lg"
            >
                {{ initials }}
            </div>
        </div>

        <!-- Bottom gradient overlay with name + muted indicator -->
        <div class="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent px-3 py-2.5">
            <span class="text-xs font-medium text-white truncate drop-shadow">{{ name }}</span>
            <div
                v-if="isAudioMuted"
                class="flex items-center gap-0.5 rounded-full bg-red-500/90 px-1.5 py-0.5 shadow"
            >
                <MicrophoneSlashIcon class="h-3 w-3 text-white" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.player {
    aspect-ratio: 16/9;
    max-height: 100%;
}
</style>
