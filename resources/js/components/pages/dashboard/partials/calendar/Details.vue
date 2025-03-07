<script setup lang="js">
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
    FwbAvatar,
    FwbCard,
    FwbBadge,
} from "flowbite-vue";
import UserIcon from "@/components/shared/UserIcon.vue";
import User from "@/components/shared/SelectUsersInCompany.vue";
import PencilIcon from "@/components/shared/icons/PencilIcon.vue";
import { useUserStore } from "@/store/user";
const calendar = useCalendarStore();
const userState = useUserStore();
const router = useRouter();
const route = useRoute();
const modalClosed = () => {
    router.push({
        query: {
            event: null,
        },
    });
};
const event = ref();
function openCall() {
    window.open(`/call/${event.value?.videocall?.slug}`, "_blank");
}
watch(
    () => [route.query.event, calendar.calendar],
    () => {
        if (route.query.event) {
            event.value = find(calendar.calendar, {
                id: toNumber(route.query.event),
            });

            console.log(event.value);
        }
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

const getRecurrenceText = () => {
    if (!event.value?.freq) return 'One-time event';
    
    if (event.value.freq === 'DAILY') {
        return 'Repeats daily';
    }
    
    if (event.value.freq === 'WEEKLY') {
        const days = event.value.freq_settings?.split(',').map(day => {
            switch(day) {
                case 'MO': return 'Monday';
                case 'TU': return 'Tuesday';
                case 'WE': return 'Wednesday';
                case 'TH': return 'Thursday';
                case 'FR': return 'Friday';
                case 'SA': return 'Saturday';
                case 'SU': return 'Sunday';
                default: return '';
            }
        }).join(', ');
        
        return `Repeats weekly on ${days}`;
    }
    
    return 'Recurring event';
};
</script>

<template>
    <fwb-modal @close="modalClosed" size="md">
        <template #header>
            <div class="flex w-full justify-between items-center">
                <div class="flex items-center">
                    <RouterLink v-if="event?.user_id === userState.user.id" class="mr-3"
                        :to="{ query: { event: event?.id, edit: 'true' } }">
                        <PencilIcon class="w-4 h-4" />
                    </RouterLink>
                    <fwb-heading v-if="event" tag="h3" class="m-0">{{ event.summary }}</fwb-heading>
                    <div v-else>Loading...</div>
                </div>
                <fwb-badge :type="event?.type === 'event' ? 'green' : 'purple'" v-if="event">
                    {{ event.type === 'event' ? 'Event' : 'Vacation' }}
                </fwb-badge>
            </div>
        </template>
        <template #body>
            <FwbSpinner v-if="!event" size="9" class="m-auto" />
            <div v-if="event" class="space-y-4">
                <!-- Event Description -->
                <fwb-card v-if="event.description" class="p-3 bg-gray-50 dark:bg-gray-800">
                    <fwb-p class="m-0">
                        {{ event.description }}
                    </fwb-p>
                </fwb-card>
                
                <!-- Event Date and Time -->
                <div class="flex flex-col gap-1">
                    <div class="text-sm text-gray-500 dark:text-gray-400">Date and Time</div>
                    <div class="font-medium">
                        {{
                            DateTime.fromISO(event.start_time).toLocaleString(
                                DateTime.DATE_FULL
                            )
                        }}
                    </div>
                    <div>
                        {{
                            DateTime.fromISO(event.start_time).toFormat('HH:mm')
                        }}
                        -
                        {{
                            DateTime.fromISO(event.end_time).toFormat('HH:mm')
                        }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400 mt-1" v-if="event.freq">
                        {{ getRecurrenceText() }}
                    </div>
                </div>
                
                <!-- Event Creator -->
                <div class="flex flex-col gap-1">
                    <div class="text-sm text-gray-500 dark:text-gray-400">Organizer</div>
                    <User show-name="true" v-model="event.user_id" :disabled="true" />
                </div>
                
                <!-- Video Call Info -->
                <div v-if="event?.videocall?.slug" class="flex flex-col gap-1">
                    <div class="text-sm text-gray-500 dark:text-gray-400">Meeting</div>
                    <div class="flex items-center gap-2">
                        <fwb-badge type="yellow">Video Conference</fwb-badge>
                        <FwbButton size="xs" color="yellow" @click="openCall">Join</FwbButton>
                    </div>
                </div>
                
                <!-- Attendees -->
                <div class="flex flex-col gap-2">
                    <div class="text-sm text-gray-500 dark:text-gray-400">Attendees</div>
                    <div class="flex flex-wrap gap-2" v-if="event.attendance?.length">
                        <div v-for="attendee in event.attendance" :key="attendee.id" 
                            class="flex items-center gap-2 p-2 border rounded-lg">
                            <UserIcon :user="attendee" />
                            <div class="flex flex-col">
                                <div class="font-medium text-sm">{{ attendee.name }}</div>
                                <div class="text-xs text-gray-500 dark:text-gray-400">
                                    {{ attendee.attending ? 'Attending' : 'Not attending' }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="text-sm text-gray-500 dark:text-gray-400">
                        No attendees
                    </div>
                </div>
            </div>
        </template>
        <template #footer>
            <div class="flex gap-2 flex-wrap">
                <template v-if="event?.user_id !== userState.user.id">
                    <fwb-button @click="acceptAttendance" size="sm">Accept</fwb-button>
                    <fwb-button @click="declineAttendance" color="red" size="sm">Decline</fwb-button>
                </template>
                <FwbButton color="yellow" size="sm" @click="openCall" v-if="event?.videocall?.slug">Join call</FwbButton>
                <FwbButton color="alternative" size="sm" @click="modalClosed">Close</FwbButton>
            </div>
        </template>
    </fwb-modal>
</template>
<style></style>
