import {
    createLocalTracks,
    LocalParticipant,
    LocalTrackPublication,
    RemoteParticipant,
    RemoteTrack,
    RemoteTrackPublication,
    Room,
    RoomEvent,
    Track,
    TrackPublication,
    VideoPresets,
} from "livekit-client";
import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";
import * as _ from "lodash";
import "../declaration";
export interface iTrack {
    track: Track;
    speaking: boolean;
    isCameraEnabled?: boolean;
    isMicEnabled?: boolean;
}

export interface iMediaDeviceInfo extends MediaDeviceInfo {
    active: boolean;
}

export interface LocalParticipantModel {
    name: null | string;
    enableMicrophone: boolean;
    shareScreen: boolean;
    enableCamera: boolean;
    token: string | null;
}

export const useLiveKit = defineStore("liveKitStore", () => {
    const tracks = ref<{
        [key: string]: Track[];
    }>({});
    const localTracks = ref<Track[]>([]);
    const url = ref<string>(window.env.VITE_LIVEKIT_URL);
    const room = ref<Room>();
    const token = ref<string>("");
    const audioDevices = ref<iMediaDeviceInfo[]>([]);
    const videoDevices = ref<iMediaDeviceInfo[]>([]);
    const videoShareTrack = ref<Track[]>([]);
    const myDevicesState = reactive<{
        isCameraEnabled: boolean;
        isMicrophoneEnabled: boolean;
    }>({
        isCameraEnabled: false,
        isMicrophoneEnabled: false,
    });

    const handleMuteAndUnMute = (
        publication: TrackPublication,
        participant: any
    ) => {
        const track = publication.track;
        if (
            _.find(
                localTracks.value,
                (obj: Track) => obj.sid === publication.trackSid
            )
        ) {
            localTracks.value = localTracks.value?.map((obj) => {
                if (obj.sid === track?.sid) {
                    return track as Track;
                }

                return obj as Track;
            });
        }

        if (!tracks.value[participant.name ?? participant.identity]) {
            return;
        }

        tracks.value[participant.name ?? participant.identity] = tracks.value[
            participant.name ?? participant.identity
        ].map((obj) => {
            if (obj.sid === track?.sid) {
                return track as Track;
            }

            return obj;
        });
    };

    function handleTrackSubscribed(
        track: RemoteTrack,
        //@ts-ignore
        publication: RemoteTrackPublication,
        participant: RemoteParticipant
    ) {
        if (
            !tracks.value.hasOwnProperty(
                participant.name ?? participant.identity
            )
        ) {
            tracks.value[participant.name ?? participant.identity] = [];
        }

        console.log({ participant: participant.name });

        if (track.source === "screen_share") {
            videoShareTrack.value.push(track);
            return;
        }

        tracks.value[participant.name ?? participant.identity].push(track);

        handleMuteAndUnMute(publication, participant);
    }

    function handleTrackUnsubscribed(
        track: RemoteTrack,
        //@ts-ignore
        publication: RemoteTrackPublication,
        participant: RemoteParticipant
    ) {
        if (track.source === "screen_share") {
            videoShareTrack.value = [];
            return;
        }

        tracks.value[participant.name ?? participant.identity] = tracks.value[
            participant.name ?? participant.identity
        ].filter((obj) => {
            return obj.sid !== track.sid;
        });

        if (!tracks.value[participant.name ?? participant.identity].length) {
            delete tracks.value[participant.name ?? participant.identity];
        }
    }

    function handleActiveSpeakerChange() {}

    function handleLocalTrackPublish(
        track: LocalTrackPublication,
        participant: LocalParticipant
    ) {
        if (!track.track) {
            return;
        }
        if (track.source === "screen_share") {
            videoShareTrack.value.push(track.track);
            return;
        }

        localTracks.value?.push(track.track as Track);
    }

    function handleLocalTrackUnPublished(
        track: LocalTrackPublication,
        participant: LocalParticipant
    ) {
        if (track.source === "screen_share") {
            videoShareTrack.value = [];
            return;
        }
        localTracks.value = localTracks.value?.filter((obj) => {
            return obj.sid !== track.trackSid;
        });
    }

    // @ts-ignore
    const initRoom = async () => {
        room.value = new Room({
            adaptiveStream: false,
            dynacast: true,
            videoCaptureDefaults: {
                resolution: VideoPresets.h1080.resolution,
            },
        });

        await room.value.prepareConnection(url.value, token.value);

        room.value
            .on(RoomEvent.TrackSubscribed, handleTrackSubscribed)
            .on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed)
            .on(RoomEvent.ActiveSpeakersChanged, handleActiveSpeakerChange)
            .on(RoomEvent.TrackMuted, handleMuteAndUnMute)
            .on(RoomEvent.TrackUnmuted, handleMuteAndUnMute)
            .on(RoomEvent.LocalTrackPublished, handleLocalTrackPublish)
            .on(RoomEvent.LocalTrackUnpublished, handleLocalTrackUnPublished);

        await createLocalTracks({
            audio: true,
            video: true,
        });
    };

    // @ts-ignore
    const loadDevices = async () => {
        await Room.getLocalDevices("videoinput").then((res) => {
            videoDevices.value = res.map((obj) => {
                return {
                    ...JSON.parse(JSON.stringify(obj)),
                    active:
                        room.value?.localParticipant.activeDeviceMap.get(
                            "videoinput"
                        ) === obj.deviceId,
                };
            });
        });
        await Room.getLocalDevices("audioinput").then((res) => {
            audioDevices.value = res.map((obj) => {
                return {
                    ...JSON.parse(JSON.stringify(obj)),
                    active:
                        room.value?.localParticipant.activeDeviceMap.get(
                            "audioinput"
                        ) === obj.deviceId,
                };
            });
        });
    };

    async function switchDevice(type: MediaDeviceKind, deviceId: string) {
        await room.value?.switchActiveDevice(type, deviceId);
        switch (type) {
            case "audioinput":
                audioDevices.value = audioDevices.value.map((obj) => {
                    return {
                        ...JSON.parse(JSON.stringify(obj)),
                        active: deviceId === obj.deviceId,
                    };
                });
                break;
            case "videoinput":
                videoDevices.value = videoDevices.value.map((obj) => {
                    return {
                        ...JSON.parse(JSON.stringify(obj)),
                        active: deviceId === obj.deviceId,
                    };
                });
                break;
        }
    }

    // @ts-ignore
    const startCall = async (
        enableMicrophone: boolean,
        enableCamera: boolean
    ) => {
        await room.value?.connect(url.value, token.value);
        await room.value?.localParticipant.enableCameraAndMicrophone();
        await room.value?.localParticipant.setCameraEnabled(enableCamera);
        await room.value?.localParticipant.setMicrophoneEnabled(
            enableMicrophone
        );
        myDevicesState.isMicrophoneEnabled = enableMicrophone;
        myDevicesState.isCameraEnabled = enableCamera;
    };

    return {
        url,
        token,
        tracks,
        room,
        myDevicesState,
        initRoom,
        startCall,
        videoDevices,
        audioDevices,
        localTracks,
        loadDevices,
        switchDevice,
        videoShareTrack,
        getLocalTracks: computed((): Track[] | undefined => {
            return localTracks.value;
        }),
        getVideoShareTracks: (): Track[] => {
            return videoShareTrack.value.filter(
                (obj) => obj.kind === Track.Kind.Video
            ) as Track[];
        },
    };
});
