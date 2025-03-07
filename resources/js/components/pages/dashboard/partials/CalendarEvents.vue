<script setup lang="js">
import Card from "@/components/shared/Card.vue";
import { onMounted, onUnmounted, ref, computed } from "vue";
import { DateTime } from "luxon";
import { useRouter } from "vue-router";
import WeekDay from "./calendar/WeekDay.vue";
import {
    FwbButton,
    FwbDropdown,
    FwbListGroup,
    FwbListGroupItem,
    FwbBadge,
    FwbButtonGroup,
} from "flowbite-vue";
import { useCalendarStore } from "@/store/calendarStore";
import Form from "./calendar/Form.vue";
import PlusSquare from "@/components/shared/icons/PlusSquare.vue";
import ArrowLeft from "@/components/shared/icons/ArrowLeft.vue";
import ArrowRight from "@/components/shared/icons/ArrowRight.vue";
import InfoIcon from "@/components/shared/icons/InfoIcon.vue";
import { useUserStore } from "@/store/user";
import Modal from "@/components/shared/Modal.vue";
import CalendarDetails from "./calendar/Details.vue";

const showInfoModal = ref(false);
const calendar = useCalendarStore();
const userStore = useUserStore();
const router = useRouter();
onMounted(() => {
    calendar.load();
    window.Echo.private(`event.${userStore.user.id}`).listen(
        "CalendarEventUpdatedEvent",
        (__obj) => {
            calendar.load();
        }
    );

    // Handle resize events to update mobile view status
    window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
    // Clean up event listener when component is destroyed
    window.removeEventListener('resize', handleResize);
});

// Window resize handler
const handleResize = () => {
    // Reset selected day when transitioning between mobile and desktop views
    if (window.innerWidth >= 768 && selectedDay.value !== null) {
        selectedDay.value = null;
    }
};

const location = window.location.href;

// Mobile week view functionality
const selectedWeek = ref(0); // 0 = first week, 1 = second week, etc.
const selectedDay = ref(null);

// Get week range for current month
const weekRanges = computed(() => {
    const numDays = calendar.currentDate.endOf('month').day;
    const firstWeekday = calendar.currentDate.startOf('month').weekday - 1;
    const totalDays = numDays + firstWeekday;
    const weekCount = Math.ceil(totalDays / 7);

    const weeks = [];
    for (let i = 0; i < weekCount; i++) {
        weeks.push({
            start: i * 7 + 1 - firstWeekday,
            end: Math.min((i + 1) * 7 - firstWeekday, numDays)
        });
    }
    return weeks;
});

// Get days for the currently selected week
const currentWeekDays = computed(() => {
    if (selectedWeek.value >= weekRanges.value.length) {
        selectedWeek.value = 0;
    }

    const currentWeek = weekRanges.value[selectedWeek.value];
    const days = [];

    // Add empty days for start of first week
    if (selectedWeek.value === 0) {
        const firstWeekday = calendar.currentDate.startOf('month').weekday - 1;
        for (let i = 0; i < firstWeekday; i++) {
            days.push(null);
        }
    }

    // Add days in the current week
    for (let day = Math.max(1, currentWeek.start); day <= currentWeek.end; day++) {
        days.push(day);
    }

    return days;
});

// Handle day selection
const selectDay = (day) => {
    if (day === selectedDay.value) {
        selectedDay.value = null;
    } else {
        selectedDay.value = day;
    }
};

// Get events for the selected day
const selectedDayEvents = computed(() => {
    if (!selectedDay.value) return [];
    return calendar.calendar.filter((obj) => obj.dates.indexOf(selectedDay.value) > -1);
});

// Check if we're on mobile view
const isMobile = computed(() => {
    return window.innerWidth < 768;
});

// Navigation between weeks
const nextWeek = () => {
    if (selectedWeek.value < weekRanges.value.length - 1) {
        selectedWeek.value++;
        selectedDay.value = null;
    }
};

const prevWeek = () => {
    if (selectedWeek.value > 0) {
        selectedWeek.value--;
        selectedDay.value = null;
    }
};

// Navigate to today
const goToToday = () => {
    // Use the store's goToToday to update the month and year
    const today = calendar.goToToday();

    // Find which week contains today
    for (let i = 0; i < weekRanges.value.length; i++) {
        const week = weekRanges.value[i];
        if (today >= week.start && today <= week.end) {
            selectedWeek.value = i;
            break;
        }
    }

    // Select today
    selectedDay.value = today;
};

// Get current route
const currentRoute = router.currentRoute.value;

// Open event details
const openEvent = (eventId) => {
    router.push({
        query: { ...currentRoute.query, event: eventId.toString() }
    });
};

// Create new event
const createNewEvent = () => {
    // Add createNewEvent query parameter
    router.push({
        path: currentRoute.path,
        query: { ...currentRoute.query, createNewEvent: 'true' }
    });
};
</script>

<template>
    <Card class="flex-col">
        <div class="flex gap-2 z-20 items-center flex-col">
            <!-- Date Controls Row -->
            <div class="flex flex-wrap gap-2 justify-between items-center w-full">
                <fwb-dropdown class="min-w-[120px]" :text="calendar.currentDate.toLocaleString({ month: 'long' })
                    ">
                    <fwb-list-group>
                        <fwb-list-group-item class="cursor-pointer" v-for="month in 12" :key="`month_${month}`" @click="
                            calendar.selectedMonth = DateTime.now()
                                .startOf('year')
                                .plus({ month: month - 1 }).month
                            ">
                            {{
                                DateTime.now()
                                    .startOf("year")
                                    .plus({ month: month - 1 })
                                    .toLocaleString({ month: "long" })
                            }}
                        </fwb-list-group-item>
                    </fwb-list-group>
                </fwb-dropdown>

                <div class="flex gap-2 items-center">
                    <fwb-button color="alternative" size="sm" @click="
                        calendar.selectedYear = DateTime.now().set({
                            year: calendar.selectedYear - 1,
                        }).year
                        ">
                        <ArrowLeft class="w-3 h-3" />
                    </fwb-button>
                    <div class="text-sm font-medium">{{ calendar.selectedYear }}</div>
                    <fwb-button color="alternative" size="sm" @click="
                        calendar.selectedYear = DateTime.now().set({
                            year: calendar.selectedYear + 1,
                        }).year
                        ">
                        <ArrowRight class="w-3 h-3" />
                    </fwb-button>
                </div>

                <!-- Action Buttons -->
                <div class="sm:ml-auto sm:mr-0 flex m-auto w-full sm:w-auto mb-2 sm:mb-0 mt-2 sm:mt-0" role="group">
                    <FwbButtonGroup class="w-full">
                        <fwb-button color="blue" class="w-full sm:w-auto" size="sm" @click="goToToday">
                            Today
                        </fwb-button>
                        <fwb-button color="alternative" class="w-full sm:w-auto flex justify-center" size="sm"
                            @click="createNewEvent">
                            <PlusSquare class="w-4 h-4" />
                        </fwb-button>
                        <fwb-button color="alternative" size="sm" @click="() => showInfoModal = true">
                            <InfoIcon class="w-5 h-5" />
                        </fwb-button>

                    </FwbButtonGroup>
                </div>
            </div>
        </div>
        <!-- Desktop Calendar View -->
        <div class="hidden md:grid grid-cols-7 w-full text-xs sm:text-sm overflow-hidden">
            <!-- Weekday Headers -->
            <div v-for="day in 7" :key="`desktop-header-${day}`" class="p-1 text-center font-medium">
                <span>{{
                    DateTime.now()
                        .startOf("week")
                        .plus({ day: day - 1 })
                        .toFormat("EEE")
                }}</span>
            </div>

            <!-- Empty cells for start of month -->
            <div v-for="n in calendar.currentDate.startOf('month').weekday - 1" :key="`desktop-empty-${n}`"
                class="bg-gray-50 dark:bg-gray-800" />

            <!-- Calendar days with events -->
            <WeekDay v-for="n in calendar.currentDate.endOf('month').day" :day="n.toString()" :key="`desktop-day-${n}`"
                :isToday="DateTime.now()
                    .set({
                        year: calendar.selectedYear,
                        month: calendar.selectedMonth,
                        day: n,
                    })
                    .startOf('day')
                    .diff(DateTime.now().startOf('day'), ['days'])
                    .toObject().days === 0
                    " :events="calendar.calendar.filter((obj) => obj.dates.indexOf(n) > -1)
                        " />
        </div>

        <!-- Mobile Calendar View -->
        <div class="md:hidden flex flex-col w-full">
            <!-- Week Navigation -->
            <div class="flex justify-between items-center mb-2">
                <fwb-button color="alternative" size="sm" @click="prevWeek" :disabled="selectedWeek === 0">
                    <ArrowLeft class="w-3 h-3" />
                </fwb-button>

                <span class="text-xs font-medium">
                    Week {{ selectedWeek + 1 }} of {{ weekRanges.length }}
                </span>
                <fwb-button color="alternative" size="sm" @click="nextWeek"
                    :disabled="selectedWeek === weekRanges.length - 1">
                    <ArrowRight class="w-3 h-3" />
                </fwb-button>

            </div>

            <!-- Mobile Week View -->
            <div class="grid grid-cols-7 w-full text-xs overflow-hidden">
                <!-- Weekday Headers -->
                <div v-for="day in 7" :key="`mobile-header-${day}`" class="p-1 text-center font-medium">
                    <span>{{
                        DateTime.now()
                            .startOf("week")
                            .plus({ day: day - 1 })
                            .toFormat("ccc")[0]
                    }}</span>
                </div>

                <!-- Days for current week -->
                <template v-for="(day, index) in currentWeekDays" :key="`mobile-day-${index}`">
                    <div v-if="day === null" class="bg-gray-50 dark:bg-gray-800 p-1"></div>
                    <div v-else @click="selectDay(day)" :class="`
                            cursor-pointer border p-2 min-h-[50px] flex flex-col justify-between
                            ${selectedDay === day ? 'bg-blue-50 dark:bg-blue-900 border-blue-400' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
                            ${DateTime.now().set({
                        year: calendar.selectedYear,
                        month: calendar.selectedMonth,
                        day: day,
                    }).startOf('day').diff(DateTime.now().startOf('day'), ['days']).toObject().days === 0
                            ? 'bg-gray-200 dark:bg-gray-600' : ''}
                        `">
                        <div class="font-medium">{{ day }}</div>
                        <div v-if="calendar.calendar.filter(obj => obj.dates.indexOf(day) > -1).length > 0"
                            class="w-2 h-2 rounded-full bg-blue-500 self-center mt-1">
                        </div>
                    </div>
                </template>
            </div>

            <!-- Selected Day Events -->
            <div v-if="selectedDay" class="mt-4 border-t pt-3">
                <h3 class="font-medium mb-2">Events for {{ DateTime.now().set({
                    year: calendar.selectedYear,
                    month: calendar.selectedMonth,
                    day: selectedDay,
                }).toFormat('LLL d, yyyy') }}</h3>

                <div v-if="selectedDayEvents.length === 0" class="text-sm text-gray-500">
                    No events scheduled for this day
                </div>

                <div v-else class="flex flex-col gap-2">
                    <div v-for="event in selectedDayEvents.sort((a, b) => new Date(a.start_time) - new Date(b.start_time))"
                        :key="`event-${event.id}`"
                        class="border p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                        @click="openEvent(event.id)">
                        <div class="flex justify-between">
                            <fwb-badge :type="event.type === 'event' && event.user_id !== userStore.user.id ? 'default' :
                                event.type === 'event' ? 'green' :
                                    event.approved ? 'purple' : 'red'
                                ">
                                {{ event.type === 'event' ? 'Event' : 'Task' }}
                            </fwb-badge>
                            <div class="text-xs text-gray-500">
                                {{ DateTime.fromISO(event.start_time).toFormat('h:mm a') }}
                            </div>
                        </div>
                        <h4 class="font-medium mt-1">{{ event.summary }}</h4>
                        <p v-if="event.description" class="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                            {{ event.description }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </Card>
    <Form v-if="calendar.showEditForm" />
    <CalendarDetails v-if="calendar.showCalendarDetails" />
    <Modal :hideModal="showInfoModal" @closed="showInfoModal = false">
        <template #header>
            <h1 class="text-lg">Subscribe to calendar</h1>
        </template>
        <template #body>
            Address: <b>{{ location }}calendar </b> <br />
            username: <b>{{ userStore.user.email }}</b> <br />
            password: <b>your password</b>
            <h2>Note</h2>
            <p>
                Check on the internet how you can subscribe to
                calendar with base base authentication.
            </p>
            <h4>For android:</h4>
            <p>Use ICSx5 or some similar app</p>
            <h4>For MacOS/iOS:</h4>
            <p>
                Open calendar click on calendars and subscribe to
                calendars
            </p>
        </template>
    </Modal>

</template>

<style scoped></style>
