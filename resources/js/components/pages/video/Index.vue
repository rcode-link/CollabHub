<script setup lang="ts">
import {chatDetails} from "../../../store/chatStore";
import {useRoute, useRouter} from "vue-router";
import '../../declaration'
import {useUserStore} from '../../../store/user';
import {useLiveKit} from "../../../functions/liveKit";
import TrackHandler from "./TrackHandler.vue";
import {FwbButton, FwbDropdown, FwbListGroup, FwbListGroupItem, FwbToggle} from "flowbite-vue";
import CameraIcon from "../../shared/icons/CameraIcon.vue";
import CameraSlashIcon from "../../shared/icons/CameraSlashIcon.vue";
import MicrophoneIcon from "../../shared/icons/MicrophoneIcon.vue";
import MicrophoneSlashIcon from "../../shared/icons/MicrophoneSlashIcon.vue";
import PhoneIcon from "../../shared/icons/PhoneEndIcon.vue";
import CogsIcon from "../../shared/icons/CogsIcon.vue";
import DispleyIcon from "../../shared/icons/DispleyIcon.vue";
import {LocalTrack, Track} from "livekit-client";
import {reactive, watch} from "vue";
import Label from "../../shared/Label.vue";
import Text from "../../shared/Text.vue";

const router = useRouter();
const messages = chatDetails();
const route = useRoute();
const userState = useUserStore();
const liveKit = useLiveKit();
const model = reactive({
    name: null,
    enableMicrophone: true,
    shareScreen: false,
    enableCamera: true,
    token: null,
});
const load = () => {
    window.axios.put(`/api/v1/video-call/${route.params.slug}/join`, {
        name: model.name
    }).then(token => {
        model.token = token.data.token;
    });
}

// load();

const endTheCall = async () => {
    window.location = '/';
}



//
const toggleCamera = async () => {
    liveKit.myDevicesState.isCameraEnabled = !liveKit.myDevicesState.isCameraEnabled
    await liveKit.room.value.localParticipant.setCameraEnabled(liveKit.myDevicesState.isCameraEnabled)
}
const toggleMicrophone = async () => {
    liveKit.myDevicesState.isMicrophoneEnabled = !liveKit.myDevicesState.isMicrophoneEnabled
    await liveKit.room.value.localParticipant.setMicrophoneEnabled(liveKit.myDevicesState.isMicrophoneEnabled)
}
//
const toggleScreenShare = async (shareScreen) => {
    await liveKit.room.value.localParticipant.setScreenShareEnabled(shareScreen);
}


watch(() => userState.user, () => {
    model.name = userState.user.name;
}, {
    immediate: true,
    deep: true
})
watch(() => model.token, async () => {
    if (!model.token) {
        return;
    }
    liveKit.token.value = model.token;
    await liveKit.initRoom();
    await liveKit.startCall(model.enableMicrophone, model.enableCamera);
    await liveKit.loadDevices();
}, {
    immediate: true
})

</script>

<template>
    <div v-if="!model.token" class="z-[60] flex h-screen w-screen justify-center items-center">
        <div class="flex flex-col gap-4 w-72">
            <div>
                <Label>
                    Name
                </Label>
                <Text v-model="model.name" :disabled="userState.user.id"/>
            </div>
            <fwb-toggle v-model="model.enableCamera" label="Enable camera"/>
            <fwb-toggle v-model="model.enableMicrophone" label="Enable microphone"/>

            <fwb-button @click="load">Start call</fwb-button>
        </div>
    </div>
    <div v-if="model.token" :class="{'fixed call-container bg-gray-100 dark:bg-gray-900 z-50': true,
  'top-0 left-0 bottom-0 right-0': true,
  }">
        <div :class="{
              'absolute z-10 bottom-5 left-0 w-full flex justify-center gap-4': true
            }">
            <fwb-button color="red" pill square @click="endTheCall">
                <PhoneIcon class="w-6 h-6"/>
            </fwb-button>
            <fwb-button :color="liveKit.myDevicesState.isCameraEnabled === false ? 'red' : 'default'" pill square
                        @click="toggleCamera">
                <CameraIcon v-if="liveKit.myDevicesState.isCameraEnabled !== false" class="w-6 h-6"/>
                <CameraSlashIcon v-if="liveKit.myDevicesState.isCameraEnabled === false" class="w-6 h-6"/>
            </fwb-button>
            <fwb-button :color="liveKit.myDevicesState.isMicrophoneEnabled === false ? 'red' : 'default'" pill square
                        @click="toggleMicrophone">
                <MicrophoneIcon v-if="liveKit.myDevicesState.isMicrophoneEnabled !== false" class="w-6 h-6"/>
                <MicrophoneSlashIcon v-if="liveKit.myDevicesState.isMicrophoneEnabled === false" class="w-6 h-6"/>
            </fwb-button>
            <fwb-button :color="model.shareScreen === true ? 'red' : 'default'" pill square @click="() => {
                model.shareScreen = !model.shareScreen;
                toggleScreenShare(model.shareScreen);
            }">
                <DispleyIcon class="w-6 h-6"/>
            </fwb-button>
            <fwb-dropdown text="Audio input" placement="top">
                <template #trigger>
                    <fwb-button pill square>
                        <CogsIcon class="w-6 h-6"/>
                    </fwb-button>
                </template>
                <template #default>
                    <div>
                        <fwb-list-group>
                            <fwb-list-group-item>
                                <p class="font-bold text-lg">Video</p>
                            </fwb-list-group-item>

                            <fwb-list-group-item class="cursor-pointer"
                                                 @click="() => liveKit.switchDevice('videoinput', obj.deviceId)"
                                                 v-for="obj in liveKit.videoDevices.value">
                                <span v-if="obj.active">&#10003;</span>  {{ obj.label }}
                            </fwb-list-group-item>
                            <fwb-list-group-item>
                                <p class="font-bold text-lg">Audio</p>
                            </fwb-list-group-item>
                            <fwb-list-group-item class="cursor-pointer"
                                                 @click="() => liveKit.switchDevice('audioinput', obj.deviceId)"
                                                 v-for="obj in liveKit.audioDevices.value">
                                <span v-if="obj.active">&#10003;</span>  {{ obj.label }}
                            </fwb-list-group-item>
                        </fwb-list-group>
                    </div>
                </template>
            </fwb-dropdown>
        </div>
        <TransitionGroup tag="div" name="calls" :class="{
            'track-container': true,
            'grid': liveKit.videoShareTrack.value.length === 0,
            'screen-share': liveKit.videoShareTrack.value.length > 0
        }">

            <TrackHandler

                v-for="item in Object.keys(liveKit.tracks.value)"
                :enableAudio="true"
                :key="liveKit.tracks.value[item].length + item"
                user-image="https://imgs.search.brave.com/GrTMprW4fg05XTsfzacsNofnbaMJuXlbLIXZqUAn9vg/rs:fit:860:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAwLzY0LzY3LzI3/LzM2MF9GXzY0Njcy/NzM2X1U1a3BkR3M5/a2VVbGw4Q1JRM3Az/WWFFdjJNNnFrVlk1/LmpwZw"
                :tracks="liveKit.tracks.value[item] as Track[]"/>
            <TrackHandler
                :enableAudio="false"
                user-image="https://imgs.search.brave.com/GrTMprW4fg05XTsfzacsNofnbaMJuXlbLIXZqUAn9vg/rs:fit:860:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAwLzY0LzY3LzI3/LzM2MF9GXzY0Njcy/NzM2X1U1a3BkR3M5/a2VVbGw4Q1JRM3Az/WWFFdjJNNnFrVlk1/LmpwZw"
                :tracks="liveKit.localTracks.value  as Track[]"/>


            <TrackHandler
                class="big"
                :enableAudio="false"
                v-if="liveKit.videoShareTrack.value.length"
                user-image="https://imgs.search.brave.com/GrTMprW4fg05XTsfzacsNofnbaMJuXlbLIXZqUAn9vg/rs:fit:860:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAwLzY0LzY3LzI3/LzM2MF9GXzY0Njcy/NzM2X1U1a3BkR3M5/a2VVbGw4Q1JRM3Az/WWFFdjJNNnFrVlk1/LmpwZw"
                :tracks="liveKit.videoShareTrack.value.filter((obj:Track) => obj.kind === Track.Kind.Video) as Track[]"/>
        </TransitionGroup>
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

.big {
    grid-row: 1/3;
    grid-column: 1/4;
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
