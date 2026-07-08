<script setup lang="js">
import { reactive, ref, watch, onMounted, onUnmounted, nextTick } from "vue";
import { DateTime } from "luxon";
import { toast } from "vue3-toastify";
import { useUserStore } from "@/store/user";
import { useVideoCallStore } from "@/store/videoCallStore";
import CameraIcon from "@/components/shared/icons/CameraIcon.vue";
import CameraSlashIcon from "@/components/shared/icons/CameraSlashIcon.vue";
import MicrophoneIcon from "@/components/shared/icons/MicrophoneIcon.vue";
import MicrophoneSlashIcon from "@/components/shared/icons/MicrophoneSlashIcon.vue";

const model = reactive({
    name: null,
    enableMicrophone: true,
    shareScreen: false,
    enableCamera: true,
    token: null,
});

const userState = useUserStore();
const videoCallStore = useVideoCallStore();
const emits = defineEmits(['update']);

// Permission + preview state
const videoRef = ref(null);
const localStream = ref(null);
const permissionState = ref('pending'); // 'pending' | 'granted' | 'denied'
const joining = ref(false);

// Waiting room state
const waitingRoom = ref(null); // null | 'waiting' | 'denied'
const requestId = ref(null);
let pollInterval = null;

const initials = () => {
    return (model.name ?? '?')
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

// Request permissions and start preview
onMounted(async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStream.value = stream;
        permissionState.value = 'granted';
        await nextTick();
        if (videoRef.value) {
            videoRef.value.srcObject = stream;
        }
    } catch {
        permissionState.value = 'denied';
        model.enableCamera = false;
        model.enableMicrophone = false;
    }
});

// Stop preview tracks when leaving lobby (prevents camera indicator staying on)
const stopPreview = () => {
    localStream.value?.getTracks().forEach(t => t.stop());
    localStream.value = null;
};

const stopPolling = () => {
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
};

onUnmounted(() => {
    stopPreview();
    stopPolling();
});

// Camera toggle → enable/disable video tracks on the preview stream
watch(() => model.enableCamera, (val) => {
    localStream.value?.getVideoTracks().forEach(t => { t.enabled = val; });
});

// Mic toggle → enable/disable audio tracks on the preview stream
watch(() => model.enableMicrophone, (val) => {
    localStream.value?.getAudioTracks().forEach(t => { t.enabled = val; });
});

watch(
    () => userState.user,
    () => { model.name = userState.user?.name ?? null; },
    { immediate: true, deep: true }
);

const pollRequestStatus = () => {
    pollInterval = setInterval(async () => {
        try {
            const res = await window.axios.get(
                `/api/v1/video-call/${videoCallStore.videoId}/request/${requestId.value}`
            );
            if (res.data.status === 'approved') {
                stopPolling();
                model.token = res.data.token;
                emits("update", model);
            } else if (res.data.status === 'denied') {
                stopPolling();
                waitingRoom.value = 'denied';
                joining.value = false;
            }
        } catch {
            // Keep polling on network errors
        }
    }, 3000);
};

// Also try to listen via Echo for instant feedback
const listenForApproval = () => {
    if (!window.Echo) return;

    window.Echo.channel(`video-call-request.${requestId.value}`)
        .listen('.App\\Events\\VideoCallJoinApproved', async () => {
            stopPolling();
            try {
                const res = await window.axios.get(
                    `/api/v1/video-call/${videoCallStore.videoId}/request/${requestId.value}`
                );
                if (res.data.token) {
                    model.token = res.data.token;
                    emits("update", model);
                }
            } catch {
                // Fallback — polling will handle it
            }
        })
        .listen('.App\\Events\\VideoCallJoinDenied', () => {
            stopPolling();
            waitingRoom.value = 'denied';
            joining.value = false;
        });
};

const load = () => {
    joining.value = true;
    // Stop preview so LiveKit can take over the devices
    stopPreview();
    window.axios
        .put(`/api/v1/video-call/${videoCallStore.videoId}/join`, {
            name: model.name,
            currentTime: DateTime.now().toISO(),
        })
        .then((res) => {
            if (res.data.token) {
                // Invited user — join immediately
                model.token = res.data.token;
                emits("update", model);
            } else if (res.data.status === 'pending') {
                // Waiting room
                waitingRoom.value = 'waiting';
                requestId.value = res.data.request_id;
                pollRequestStatus();
                listenForApproval();
            }
        })
        .catch((error) => {
            joining.value = false;
            toast.error(error.response?.data?.message ?? 'Failed to join call');
        });
};

const goBack = () => {
    window.location.href = "/";
};

const retryJoin = () => {
    waitingRoom.value = null;
    requestId.value = null;
    joining.value = false;
};
</script>

<template>
    <div class="relative flex h-screen w-screen items-center justify-center bg-gray-900 overflow-hidden">
        <!-- Ambient glow blobs -->
        <div class="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl"></div>
        <div class="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl"></div>

        <!-- Waiting for approval overlay -->
        <div v-if="waitingRoom === 'waiting'"
            class="relative z-10 flex flex-col items-center gap-6 text-center px-4">
            <div class="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-blue-700/20 backdrop-blur-sm">
                <svg class="h-10 w-10 animate-spin text-blue-400" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            </div>
            <div>
                <h2 class="text-xl font-semibold text-white">Waiting for approval</h2>
                <p class="mt-2 text-sm text-gray-400">
                    The host has been notified. You'll join automatically once approved.
                </p>
            </div>
            <button
                type="button"
                @click="goBack"
                class="rounded-xl border border-gray-600 bg-gray-800 px-6 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-gray-700"
            >
                Leave
            </button>
        </div>

        <!-- Request denied overlay -->
        <div v-else-if="waitingRoom === 'denied'"
            class="relative z-10 flex flex-col items-center gap-6 text-center px-4">
            <div class="flex h-20 w-20 items-center justify-center rounded-full bg-red-900/30">
                <svg class="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" />
                </svg>
            </div>
            <div>
                <h2 class="text-xl font-semibold text-white">Request denied</h2>
                <p class="mt-2 text-sm text-gray-400">
                    Your request to join this call was not approved.
                </p>
            </div>
            <div class="flex gap-3">
                <button
                    type="button"
                    @click="goBack"
                    class="rounded-xl border border-gray-600 bg-gray-800 px-6 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-gray-700"
                >
                    Go back
                </button>
                <button
                    type="button"
                    @click="retryJoin"
                    class="rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                    Try again
                </button>
            </div>
        </div>

        <!-- Normal join form -->
        <div v-else class="relative z-10 flex w-full max-w-4xl flex-col gap-6 px-4 lg:flex-row lg:items-center lg:gap-10">

            <!-- Left: camera preview -->
            <div class="flex-1">
                <div class="relative overflow-hidden rounded-2xl bg-gray-800 shadow-2xl" style="aspect-ratio: 16/9">

                    <!-- Requesting permissions spinner -->
                    <div v-if="permissionState === 'pending'"
                        class="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-400">
                        <svg class="h-8 w-8 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span class="text-sm">Requesting camera access…</span>
                    </div>

                    <!-- Permission denied warning -->
                    <div v-else-if="permissionState === 'denied'"
                        class="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
                        <div class="flex h-14 w-14 items-center justify-center rounded-full bg-red-900/40 text-red-400">
                            <CameraSlashIcon class="h-7 w-7" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-red-400">Camera & microphone access denied</p>
                            <p class="mt-1 text-xs text-gray-500">Allow access in your browser settings, then reload the page.</p>
                        </div>
                    </div>

                    <!-- Live video preview -->
                    <template v-else>
                        <!-- Camera on: live feed -->
                        <video
                            v-show="model.enableCamera"
                            ref="videoRef"
                            autoplay
                            muted
                            playsinline
                            class="h-full w-full object-cover scale-x-[-1]"
                        />

                        <!-- Camera off: initials avatar -->
                        <div v-show="!model.enableCamera"
                            class="absolute inset-0 flex items-center justify-center bg-gray-800">
                            <div class="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-2xl font-bold text-white select-none shadow-lg">
                                {{ initials() }}
                            </div>
                        </div>

                        <!-- Mic muted badge -->
                        <div v-if="!model.enableMicrophone"
                            class="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-red-600/90 px-2.5 py-1 text-xs text-white shadow backdrop-blur-sm">
                            <MicrophoneSlashIcon class="h-3.5 w-3.5" />
                            Muted
                        </div>

                        <!-- Name badge -->
                        <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3">
                            <span class="text-sm font-medium text-white drop-shadow">{{ model.name }}</span>
                        </div>
                    </template>
                </div>
            </div>

            <!-- Right: form card -->
            <div class="w-full lg:w-80">
                <!-- Header -->
                <div class="mb-5 text-center lg:text-left">
                    <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg lg:mx-0">
                        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                        </svg>
                    </div>
                    <h1 class="text-xl font-semibold text-white">Ready to join?</h1>
                    <p class="mt-1 text-sm text-gray-400">Check your devices below</p>
                </div>

                <div class="rounded-2xl border border-gray-700/50 bg-gray-800/80 p-5 shadow-2xl backdrop-blur-sm space-y-4">

                    <!-- Name -->
                    <div>
                        <label class="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400">
                            Display name
                        </label>
                        <input
                            v-model="model.name"
                            :disabled="!!userState.user?.id"
                            type="text"
                            class="w-full rounded-xl border border-gray-600 bg-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                            placeholder="Your name"
                        />
                    </div>

                    <!-- Device toggles -->
                    <div class="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            :disabled="permissionState === 'denied'"
                            @click="model.enableCamera = !model.enableCamera"
                            :class="[
                                'flex flex-col items-center justify-center gap-2 rounded-xl border py-4 text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed',
                                model.enableCamera
                                    ? 'border-gray-600 bg-gray-700 text-white hover:bg-gray-600'
                                    : 'border-red-500/40 bg-red-900/20 text-red-400 hover:bg-red-900/30',
                            ]"
                        >
                            <CameraIcon v-if="model.enableCamera" class="h-5 w-5" />
                            <CameraSlashIcon v-else class="h-5 w-5" />
                            <span class="text-xs">{{ model.enableCamera ? 'Camera on' : 'Camera off' }}</span>
                        </button>

                        <button
                            type="button"
                            :disabled="permissionState === 'denied'"
                            @click="model.enableMicrophone = !model.enableMicrophone"
                            :class="[
                                'flex flex-col items-center justify-center gap-2 rounded-xl border py-4 text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed',
                                model.enableMicrophone
                                    ? 'border-gray-600 bg-gray-700 text-white hover:bg-gray-600'
                                    : 'border-red-500/40 bg-red-900/20 text-red-400 hover:bg-red-900/30',
                            ]"
                        >
                            <MicrophoneIcon v-if="model.enableMicrophone" class="h-5 w-5" />
                            <MicrophoneSlashIcon v-else class="h-5 w-5" />
                            <span class="text-xs">{{ model.enableMicrophone ? 'Mic on' : 'Mic off' }}</span>
                        </button>
                    </div>

                    <!-- Join -->
                    <button
                        type="button"
                        :disabled="joining"
                        @click="load"
                        class="w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <span v-if="joining" class="flex items-center justify-center gap-2">
                            <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Joining…
                        </span>
                        <span v-else>Join call</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
