<script setup lang="js">
import { useLiveKit } from "../../../../functions/liveKit";
import TrackHandler from "../TrackHandler.vue";

const liveKit = useLiveKit();
</script>

<template>
    <!-- Normal mode: centered grid of all participants -->
    <div v-if="!liveKit.videoShareTrack.length" class="video-grid">
        <TrackHandler
            v-for="item in Object.keys(liveKit.tracks)"
            :enableAudio="true"
            :key="liveKit.tracks[item].length + item"
            :name="item"
            :tracks="liveKit.tracks[item]"
        />
        <TrackHandler
            v-if="liveKit.getLocalTracks"
            :enableAudio="false"
            name="Me"
            :tracks="liveKit.getLocalTracks"
        />
    </div>

    <!-- Screen share mode: participants row on top, screen below full width -->
    <div v-else class="screen-share-layout">
        <!-- User tiles in a scrollable row at the top -->
        <div class="participants-row">
            <TrackHandler
                v-for="item in Object.keys(liveKit.tracks)"
                :enableAudio="true"
                :key="liveKit.tracks[item].length + item"
                :name="item"
                :tracks="liveKit.tracks[item]"
            />
            <TrackHandler
                v-if="liveKit.getLocalTracks"
                :enableAudio="false"
                name="Me"
                :tracks="liveKit.getLocalTracks"
            />
        </div>

        <!-- Shared screen — full width below -->
        <div class="screen-share-area">
            <TrackHandler
                :enableAudio="false"
                name="Screen Share"
                :tracks="liveKit.getVideoShareTracks()"
            />
        </div>
    </div>
</template>

<style scoped>
/* Normal grid */
.video-grid {
    height: 100%;
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    padding-bottom: 5rem;
}

/* Screen share layout: flex column */
.screen-share-layout {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem;
    padding-bottom: 5rem;
}

/* Top row: participant thumbnails */
.participants-row {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    overflow-x: auto;
    flex-shrink: 0;
}

.participants-row > * {
    width: 10rem;
    flex-shrink: 0;
}

/* Bottom: shared screen fills remaining space */
.screen-share-area {
    flex: 1;
    min-height: 0;
    display: flex;
}

.screen-share-area > * {
    flex: 1;
    min-width: 0;
    aspect-ratio: unset !important;
    max-height: unset !important;
    height: 100%;
}
</style>
