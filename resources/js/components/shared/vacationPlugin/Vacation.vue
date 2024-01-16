<script setup lang="ts">
import {NodeViewWrapper} from "@tiptap/vue-3";
import {computed, onMounted, ref} from "vue";
import {FwbButton, FwbHeading, FwbTable, FwbTableCell, FwbTableHeadCell, FwbTableRow} from "flowbite-vue";
import UserIcon from "../UserIcon.vue";
import {DateTime} from "luxon";

const props = defineProps({
    node: {}
});

const event = ref({
    creator: {
        name: '',
        avatar: ''
    }
});
onMounted(() => {
    axios.get(`/api/v1/event/${props.node.attrs.eventId}`).then((res) => event.value = res.data.data);
})

const response = (status) => {
    axios.put(`/api/v1/vacation/${props.node.attrs.eventId}`, {
        status
    })
}

const endDays = computed(() => {
    return event.value.freq_until ? DateTime.fromISO(event.value.freq_until) : DateTime.fromISO(event.value.start_time);
})
</script>

<template>
    <node-view-wrapper>
        <div>
            <fwb-table striped-columns hoverable>
                <fwb-table-row>
                    <fwb-table-head-cell>
                        Status
                    </fwb-table-head-cell>
                    <fwb-table-cell class="flex gap-2 items-center justify-end">
                        <template v-if="event.approved">
                            Approved <span class="w-2 h-2 bg-green-600 block rounded-full" />
                        </template>

                        <template v-if="!event.approved">
                            Pending <span class="w-2 h-2 bg-yellow-500 block rounded-full" />
                        </template>

                        <template v-if="!event.approved && event.managers?.length === 0">
                            Denied <span class="w-2 h-2 bg-red-600 block rounded-full" />
                        </template>
                    </fwb-table-cell>
                </fwb-table-row>
                <fwb-table-row>
                    <fwb-table-head-cell>
                        Title
                    </fwb-table-head-cell>
                    <fwb-table-cell>
                        {{ event.summary }}
                    </fwb-table-cell>
                </fwb-table-row>
                <fwb-table-row>
                    <fwb-table-head-cell>
                        Description
                    </fwb-table-head-cell>
                    <fwb-table-cell>
                        {{ event.description }}
                    </fwb-table-cell>
                </fwb-table-row>
                <fwb-table-row>
                    <fwb-table-head-cell>
                        Start Date
                    </fwb-table-head-cell>
                    <fwb-table-cell>
                        {{ DateTime.fromISO(event.start_time).toLocaleString(DateTime.DATE_SHORT) }}
                    </fwb-table-cell>
                </fwb-table-row>
                <fwb-table-row>
                    <fwb-table-head-cell>
                        End Date
                    </fwb-table-head-cell>
                    <fwb-table-cell>
                        {{
                            endDays.toLocaleString(DateTime.DATE_SHORT)
                        }}
                    </fwb-table-cell>
                </fwb-table-row>
                <fwb-table-row>
                    <fwb-table-head-cell>
                        Total number of days
                    </fwb-table-head-cell>
                    <fwb-table-cell>
                        {{
                            Math.floor(endDays.diff(DateTime.fromISO(event.start_time), ['days']).toObject().days).toFixed(0)
                        }}
                    </fwb-table-cell>
                </fwb-table-row>
                <fwb-table-row>
                    <fwb-table-head-cell>
                        Start time
                    </fwb-table-head-cell>
                    <fwb-table-cell>
                        {{ DateTime.fromISO(event.start_time).toLocaleString(DateTime.TIME_24_SIMPLE) }}
                    </fwb-table-cell>
                </fwb-table-row>
                <fwb-table-row>
                    <fwb-table-head-cell>
                        End time
                    </fwb-table-head-cell>
                    <fwb-table-cell>
                        {{ DateTime.fromISO(event.end_time).toLocaleString(DateTime.TIME_24_SIMPLE) }}
                    </fwb-table-cell>
                </fwb-table-row>
            </fwb-table>

            <fwb-button class="mt-4" @click="() => response('accept')">Approve</fwb-button>
            <fwb-button class="mt-4 ml-4" color="red" @click="() => response('decline')">Decline</fwb-button>
        </div>
    </node-view-wrapper>
</template>

<style scoped>

</style>
