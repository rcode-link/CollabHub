<script setup lang="js">
import { ref, onMounted, onUnmounted } from "vue";
import { useVideoCallStore } from "@/store/videoCallStore";

const videoCallStore = useVideoCallStore();
const requests = ref([]);
let echoChannel = null;

const fetchRequests = async () => {
    try {
        const res = await window.axios.get(
            `/api/v1/video-call/${videoCallStore.videoId}/requests`
        );
        requests.value = res.data;
    } catch {
        // Silently fail — will retry on next event
    }
};

const approve = async (id) => {
    try {
        await window.axios.put(
            `/api/v1/video-call/${videoCallStore.videoId}/request/${id}/approve`
        );
        requests.value = requests.value.filter(r => r.id !== id);
    } catch {
        // noop
    }
};

const deny = async (id) => {
    try {
        await window.axios.put(
            `/api/v1/video-call/${videoCallStore.videoId}/request/${id}/deny`
        );
        requests.value = requests.value.filter(r => r.id !== id);
    } catch {
        // noop
    }
};

onMounted(() => {
    fetchRequests();

    if (window.Echo) {
        echoChannel = window.Echo.private(`video-call.${videoCallStore.videoId}`)
            .listen('.App\\Events\\VideoCallJoinRequest', (data) => {
                // Add the new request if not already present
                if (!requests.value.find(r => r.id === data.id)) {
                    requests.value.push(data);
                }
            });
    }
});

onUnmounted(() => {
    if (echoChannel) {
        echoChannel.stopListening('.App\\Events\\VideoCallJoinRequest');
    }
});
</script>

<template>
    <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-2"
    >
        <div v-if="requests.length" class="absolute top-4 right-4 z-50 w-72 space-y-2">
            <div class="rounded-xl border border-gray-700/50 bg-gray-800/95 p-3 shadow-2xl backdrop-blur-sm">
                <h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Join requests
                </h3>
                <TransitionGroup
                    enter-active-class="transition duration-200 ease-out"
                    enter-from-class="opacity-0 scale-95"
                    enter-to-class="opacity-100 scale-100"
                    leave-active-class="transition duration-150 ease-in"
                    leave-from-class="opacity-100 scale-100"
                    leave-to-class="opacity-0 scale-95"
                    tag="div"
                    class="space-y-2"
                >
                    <div
                        v-for="req in requests"
                        :key="req.id"
                        class="flex items-center justify-between gap-3 rounded-lg bg-gray-700/50 px-3 py-2.5"
                    >
                        <div class="flex items-center gap-2.5 min-w-0">
                            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-blue-600 text-xs font-bold text-white">
                                {{ (req.name ?? '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) }}
                            </div>
                            <span class="truncate text-sm font-medium text-white">{{ req.name }}</span>
                        </div>
                        <div class="flex shrink-0 gap-1.5">
                            <button
                                type="button"
                                @click="approve(req.id)"
                                class="rounded-lg bg-green-600 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-green-500"
                                title="Approve"
                            >
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                @click="deny(req.id)"
                                class="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-red-500"
                                title="Deny"
                            >
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </TransitionGroup>
            </div>
        </div>
    </transition>
</template>
