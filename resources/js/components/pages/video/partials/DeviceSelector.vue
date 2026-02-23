<script lang="js" setup>
import { useLiveKit } from "@/functions/liveKit";
import CogsIcon from "@/components/shared/icons/CogsIcon.vue";
//@ts-ignore
import DeviceSelectorItem from "@/components/pages/video/partials/DeviceSelectorItem.vue";
//@ts-ignore
import { FwbDropdown } from "flowbite-vue";

const liveKit = useLiveKit();
</script>

<template>
    <fwb-dropdown placement="top">
        <template #trigger>
            <button
                type="button"
                title="Audio & video settings"
                class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 text-white shadow-md transition hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
                <CogsIcon class="h-5 w-5" />
            </button>
        </template>
        <template #default>
            <div class="min-w-[200px] rounded-xl bg-gray-800 border border-gray-700 shadow-xl overflow-hidden">
                <div class="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400 border-b border-gray-700">
                    Video input
                </div>
                <DeviceSelectorItem
                    type="videoinput"
                    v-for="(obj, i) in liveKit.videoDevices"
                    :key="i"
                    :device="obj"
                />
                <div class="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400 border-y border-gray-700">
                    Audio input
                </div>
                <DeviceSelectorItem
                    type="audioinput"
                    v-for="(obj, i) in liveKit.audioDevices"
                    :key="i"
                    :device="obj"
                />
            </div>
        </template>
    </fwb-dropdown>
</template>
