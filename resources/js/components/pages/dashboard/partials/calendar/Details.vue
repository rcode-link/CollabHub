<script setup lang="ts">
import { watch, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { DateTime } from "luxon";
import { useCalendarStore } from "@/store/calendarStore";
import { find, toNumber } from "lodash";
import {
    FwbModal,
    FwbButton,
    FwbSpinner,
    FwbHeading,
    FwbP,
    FwbTable,
    FwbTableBody,
    FwbTableCell,
    FwbTableHead,
    FwbTableHeadCell,
    FwbTableRow,
} from "flowbite-vue";
import UserIcon from "@/components/shared/UserIcon.vue";
import User from "@/components/shared/SelectUsersInCompany.vue";
import { EventResource } from "@/types";
const calendar = useCalendarStore();
const router = useRouter();
const route = useRoute();
const modalClosed = () => {
    router.push({
        query: {
            event: null,
        },
    });
    showModal.value = false;
};
const event = ref<EventResource>();
const showModal = ref(false);
watch(
    () => [route.query.event, calendar.calendar],
    () => {
        if (route.query.event) {
            showModal.value = true;
            event.value = find(calendar.calendar, {
                id: toNumber(route.query.event),
            });
            return;
        }

        showModal.value = false;
    },
    {
        immediate: true,
        deep: true,
    }
);

const acceptAttendance = () => {
    window.axios.put(`/api/v1/event/${route.query.event}`, {
        attendance: true,
    });
};

const declineAttendance = () => {
    window.axios.put(`/api/v1/event/${route.query.event}`, {
        attendance: false,
    });
};
</script>

<template>
    <fwb-modal v-if="showModal" @close="modalClosed">
        <template #header>
            <fwb-heading v-if="event" tag="h3">{{ event.summary }}</fwb-heading>
            <div v-else>Loading...</div>
        </template>
        <template #body>
            <FwbSpinner v-if="!event" size="9" class="m-auto" />
            <div v-if="event">
                <fwb-p>
                    {{ event.description ?? "" }}
                </fwb-p>
                <fwb-p>
                    Event time:

                    {{
                        DateTime.fromISO(event.start_time).toLocaleString(
                            DateTime.DATE_SHORT
                        )
                    }}
                    {{
                        DateTime.fromISO(event.start_time).toLocaleString(
                            DateTime.TIME_24_SIMPLE
                        )
                    }}
                    -
                    {{
                        DateTime.fromISO(event.end_time).toLocaleString(
                            DateTime.TIME_24_SIMPLE
                        )
                    }}
                </fwb-p>
                <fwb-p>
                    Created by:
                    <User
                        show-name="true"
                        v-model="event.user_id"
                        :disabled="true"
                    />
                </fwb-p>
                <fwb-p> Attendees: </fwb-p>
                <fwb-table hoverable>
                    <fwb-table-head>
                        <fwb-table-head-cell></fwb-table-head-cell>
                        <fwb-table-head-cell>Name</fwb-table-head-cell>
                        <fwb-table-head-cell>Email</fwb-table-head-cell>
                        <fwb-table-head-cell
                            class="text-right"
                        ></fwb-table-head-cell>
                    </fwb-table-head>
                    <fwb-table-body v-if="event.attendance">
                        <fwb-table-row
                            v-for="obj in event.attendance"
                            :key="obj.id"
                        >
                            <fwb-table-cell>
                                <UserIcon :user="obj" />
                            </fwb-table-cell>
                            <fwb-table-cell>
                                {{ obj.name }}
                            </fwb-table-cell>
                            <fwb-table-cell>
                                {{ obj.email }}
                            </fwb-table-cell>
                            <fwb-table-cell>
                                {{
                                    obj.attending
                                        ? "Attending"
                                        : "Not attending"
                                }}
                            </fwb-table-cell>
                        </fwb-table-row>
                    </fwb-table-body>
                </fwb-table>
            </div>
        </template>
        <template #footer>
            <fwb-button @click="acceptAttendance">Accept</fwb-button>
            <fwb-button @click="declineAttendance" color="red" class="ml-4"
                >Decline</fwb-button
            >
        </template>
    </fwb-modal>
</template>
<style></style>
