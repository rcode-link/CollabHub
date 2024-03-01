<script setup lang="js">
import Modal from "@/components/shared/Modal.vue";
import Label from "@/components/shared/Label.vue";
import Text from "@/components/shared/Text.vue";
import DatePicker from "@/components/shared/DatePicker.vue";
import { useCalendarStore } from "@/store/calendarStore";
import {
    FwbButton,
    FwbCheckbox,
    FwbSelect,
    FwbTable,
    FwbTableBody,
    FwbTableCell,
    FwbTableHead,
    FwbTableHeadCell,
    FwbTableRow,
} from "flowbite-vue";
import Errors from "@/components/shared/Errors.vue";
import SelectUsersInCompany from "@/components/shared/SelectUsersInCompany.vue";
import UserIcon from "@/components/shared/UserIcon.vue";
import TrashIcon from "@/components/shared/icons/TrashIcon.vue";
import { onUpdated, watch } from "vue";
import flatPickr from "vue-flatpickr-component";

import { useErrorsStore } from "@/store/errors";
import InteractiveToast from "@/components/shared/InteractiveToast.vue";
import { useRoute } from "vue-router";
import { find, toNumber } from "lodash";
import { DateTime } from "luxon";

const route = useRoute();
const calendar = useCalendarStore();
const errorsStore = useErrorsStore();

onUpdated(() => {
    errorsStore.setErrors([], "");
});

watch(
    () => [route.query.event, calendar.calendar],
    () => {
        if (!calendar.calendar.length) {
            return;
        }
        if (route.query.edit === "true") {
            const obj = find(calendar.calendar, {
                id: toNumber(route.query.event),
            });

            calendar.setItem(obj);
        }
    },
    {
        immediate: true,
        deep: true,
    }
);
</script>

<template>
    <Modal :hide-modal="calendar.showEditForm" @closed="calendar.closeModal">
        <template #header>
            <h1>
                <template v-if="calendar.form.id"> Event details </template>
                <template v-else> Create new event </template>
            </h1>
        </template>
        <template #body>
            <form @submit.prevent="calendar.save" class="flex flex-col gap-4">
                <fwb-select
                    label="Type *"
                    v-model="calendar.form.type"
                    :options="calendar.calendarItemType"
                />
                <div>
                    <Label forInput="summary">Title *</Label>
                    <Text v-model="calendar.form.summary" />
                    <Errors name="summary" />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label forInput="start_time">Start time *</Label>
                        <flat-pickr
                            v-model="calendar.form.start_time"
                            class="input"
                            :config="{
                                enableTime: true,
                                altInput: true,
                                time_24hr: true,
                                dateFormat: 'Z',
                                altFormat: 'd/m/Y H:i',
                            }"
                            :name="'start_time'"
                        />
                        <Errors name="start_time" />
                    </div>
                    <div>
                        <Label forInput="end_time">End time *</Label>
                        <flat-pickr
                            v-model="calendar.form.end_time"
                            class="input"
                            :config="{
                                enableTime: true,
                                altInput: true,
                                time_24hr: true,
                                noCalendar: true,
                                dateFormat: 'Z',
                                altFormat: 'H:i',
                                minTime: DateTime.fromISO(
                                    calendar.form.start_time
                                ).toLocaleString(DateTime.TIME_24_SIMPLE),
                                maxTime: '23:00',
                            }"
                            :name="'end_time'"
                        />
                        <Errors name="end_time" />
                    </div>
                </div>

                <div v-if="calendar.form.type === 'vacation'">
                    <Label>End date</Label>
                    <DatePicker v-model="calendar.form.freq_until" />
                    <Errors name="freq_until" />
                </div>

                <fwb-checkbox
                    v-if="calendar.form.type !== 'vacation'"
                    label="Advanced form"
                    v-model="calendar.showAdvancedSettings"
                />
                <fwb-checkbox
                    v-if="calendar.form.type !== 'vacation'"
                    label="Has video conference"
                    v-model="calendar.form.has_video"
                />
                <template
                    v-if="
                        calendar.showAdvancedSettings &&
                        calendar.form.type !== 'vacation'
                    "
                >
                    <div>
                        <Label forInput="description">Description</Label>
                        <textarea
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            v-model="calendar.form.description"
                        />
                        <Errors name="description" />
                    </div>
                    <fwb-select
                        v-model="calendar.form.freq"
                        :options="[
                            { value: '', name: 'No repeat' },
                            { value: 'WEEKLY', name: 'WEEKLY' },
                            { value: 'DAILY', name: 'DAILY' },
                        ]"
                        label="Repeating"
                    />
                    <div v-if="calendar.form.freq">
                        <Label>Repeat Until</Label>
                        <DatePicker v-model="calendar.form.freq_until" />
                        <Errors name="freq_until" />
                    </div>
                    <template v-if="calendar.form.freq === 'WEEKLY'">
                        <div>
                            <Label>Repeat on days</Label>
                            <fwb-checkbox
                                v-for="day in calendar.byDay"
                                :key="day.label"
                                :label="day.label"
                                v-model="calendar.form.freq_settings[day.value]"
                            />
                        </div>
                    </template>
                    <SelectUsersInCompany
                        @selected-user="(obj) => calendar.form.users.push(obj)"
                    />
                    <fwb-table hoverable>
                        <fwb-table-head>
                            <fwb-table-head-cell></fwb-table-head-cell>
                            <fwb-table-head-cell>Name</fwb-table-head-cell>
                            <fwb-table-head-cell>Email</fwb-table-head-cell>
                            <fwb-table-head-cell>Status</fwb-table-head-cell>
                            <fwb-table-head-cell
                                class="text-right"
                            ></fwb-table-head-cell>
                        </fwb-table-head>
                        <fwb-table-body>
                            <fwb-table-row
                                v-for="(obj, index) in calendar.form.users"
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

                                <fwb-table-cell>
                                    <fwb-button
                                        color="red"
                                        @click.prevent="
                                            () =>
                                                calendar.form.users.splice(
                                                    index,
                                                    1
                                                )
                                        "
                                    >
                                        <TrashIcon class="w-4 h-4" />
                                    </fwb-button>
                                </fwb-table-cell>
                            </fwb-table-row>
                        </fwb-table-body>
                    </fwb-table>
                </template>
            </form>
        </template>
        <template #footer>
            <div class="flex justify-between">
                <div>
                    <FwbButton @click="calendar.save">Save</FwbButton>
                </div>
                <interactive-toast>
                    <template #trigger>
                        <FwbButton color="red" class="ml-auto"
                            >Delete</FwbButton
                        >
                    </template>
                    <template #title>You are about to delete event</template>
                    <template #content
                        >Are you sure you want to delete event?</template
                    >
                    <template #actions>
                        <FwbButton
                            color="red"
                            @click="calendar.deleteEvent"
                            size="xs"
                            >Yes, Delete it</FwbButton
                        >
                    </template>
                </interactive-toast>
            </div>
        </template>
    </Modal>
</template>

<style scoped></style>
