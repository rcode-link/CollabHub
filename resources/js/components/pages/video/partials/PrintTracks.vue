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
      user-image="https://imgs.search.brave.com/GrTMprW4fg05XTsfzacsNofnbaMJuXlbLIXZqUAn9vg/rs:fit:860:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAwLzY0LzY3LzI3/LzM2MF9GXzY0Njcy/NzM2X1U1a3BkR3M5/a2VVbGw4Q1JRM3Az/WWFFdjJNNnFrVlk1/LmpwZw"
      :tracks="liveKit.tracks[item]"
    />
    <TrackHandler
      :enableAudio="false"
      :name="'Me'"
      user-image="https://imgs.search.brave.com/GrTMprW4fg05XTsfzacsNofnbaMJuXlbLIXZqUAn9vg/rs:fit:860:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAwLzY0LzY3LzI3/LzM2MF9GXzY0Njcy/NzM2X1U1a3BkR3M5/a2VVbGw4Q1JRM3Az/WWFFdjJNNnFrVlk1/LmpwZw"
      :tracks="liveKit.localTracks"
    />

    <TrackHandler
      class="big"
      :enableAudio="false"
      v-if="liveKit.videoShareTrack.length"
      user-image="https://imgs.search.brave.com/GrTMprW4fg05XTsfzacsNofnbaMJuXlbLIXZqUAn9vg/rs:fit:860:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAwLzY0LzY3LzI3/LzM2MF9GXzY0Njcy/NzM2X1U1a3BkR3M5/a2VVbGw4Q1JRM3Az/WWFFdjJNNnFrVlk1/LmpwZw"
      :tracks="
        liveKit.videoShareTrack.filter((obj) => obj.kind === Track.Kind.Video)
      "
    />
  </TransitionGroup>
</template>