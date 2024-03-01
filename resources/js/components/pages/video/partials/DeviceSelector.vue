<script lang="js" setup>
import { useLiveKit } from "../../../../functions/liveKit";
import CogsIcon from "../../../shared/icons/CogsIcon.vue";
//@ts-ignore
import DeviceSelectorItem from "./DeviceSelectorItem.vue";
//@ts-ignore
import {
  FwbButton,
  FwbDropdown,
  FwbListGroup,
  FwbListGroupItem,
} from "flowbite-vue";
const liveKit = useLiveKit();
</script>
<template>
    <fwb-dropdown text="Audio input" placement="top">
        <template #trigger>
            <fwb-button pill square>
                <CogsIcon class="w-6 h-6" />
            </fwb-button>
        </template>
        <template #default>
            <div>
                <fwb-list-group>
                    <fwb-list-group-item>
                        <p class="font-bold text-lg">Video</p>
                    </fwb-list-group-item>

                    <DeviceSelectorItem
                        type="videoinput"
                        v-for="(obj, i) in liveKit.videoDevices"
                        :key="i"
                        :device="obj"
                    />

                    <fwb-list-group-item>
                        <p class="font-bold text-lg">Audio</p>
                    </fwb-list-group-item>
                    <DeviceSelectorItem
                        type="audioinput"
                        v-for="(obj, i) in liveKit.audioDevices"
                        :key="i"
                        :device="obj"
                    />
                </fwb-list-group>
            </div>
        </template>
    </fwb-dropdown>
</template>
