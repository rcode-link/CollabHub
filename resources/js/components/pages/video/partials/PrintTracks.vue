<script setup lang="ts">
import { Track } from "livekit-client";
import { useLiveKit } from "../../../../functions/liveKit";
//@ts-ignore
import TrackHandler from "../TrackHandler.vue";

const liveKit = useLiveKit();
</script>
<template>
  <TransitionGroup
    tag="div"
    name="calls"
    :class="{
      'track-container': true,
      grid: liveKit.videoShareTrack.length === 0,
      'screen-share': liveKit.videoShareTrack.length > 0,
    }"
  >
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
      :name="'Me'"
      :tracks="liveKit.getLocalTracks"
    />

    <TrackHandler
      class="big"
      :enableAudio="false"
      name="Screen Share"
      v-if="liveKit.videoShareTrack.length"
      :tracks="liveKit.getVideoShareTracks()"
    />
  </TransitionGroup>
</template>