<script setup lang="ts">
import Modal from "../../../../shared/Modal.vue";
import Label from "../../../../shared/Label.vue";
import Text from "../../../../shared/Text.vue";
import DatePicker from "../../../../shared/DatePicker.vue";
import { useCalendarStore } from "../../../../../store/calendarStore.js";
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
import Errors from "../../../../shared/Errors.vue";
import SelectUsersInCompany from "../../../../shared/SelectUsersInCompany.vue";
import UserIcon from "../../../../shared/UserIcon.vue";
import TrashIcon from "../../../../shared/icons/TrashIcon.vue";
import { onUpdated, ref, watch } from "vue";
import { useErrorsStore } from "../../../../../store/errors";
import { useRouter } from "vue-router";
import InteractiveToast from "../../../../shared/InteractiveToast.vue";
import TimePicker from "../../../../shared/TimePicker.vue";
import { DateTime } from "luxon";
import { useUserStore } from "../../../../../store/user";

const calendar = useCalendarStore();
const errorsStore = useErrorsStore();
const router = useRouter();
const userStore = useUserStore();

function openCall() {
  window.open(`/call/${calendar.videoCall.slug}`, "_blank");
}

onUpdated(() => {
  errorsStore.setErrors([], "");
});

const date = ref("");

watch(
  () => calendar.form.start_time,
  () => {
    if (calendar.form.end_time) {
      return;
    }
    calendar.form.end_time = DateTime.fromISO(calendar.form.start_time)
      .set({
        hour: DateTime.now().hour,
        minute: DateTime.now().minute,
      })
      .toISO();
  },
  {
    deep: true,
  }
);
</script>

<template>
  <Modal :hide-modal="calendar.isModalVisible" @closed="calendar.closeModal">
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
          <div class="md:col-span-2">
            <Label forInput="event_date">Date *</Label>
            <DatePicker
              v-model="calendar.form.start_time"
              :name="'event_date'"
            />
            <Errors name="start_time" />
          </div>
          <div>
            <Label forInput="start_time">Start time *</Label>
            <TimePicker
              v-model="calendar.form.start_time"
              :name="'start_time'"
            />
            <Errors name="start_time" />
          </div>
          <div>
            <Label forInput="end_time">End time *</Label>
            <TimePicker v-model="calendar.form.end_time" :name="'end_time'" />
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
            calendar.showAdvancedSettings && calendar.form.type !== 'vacation'
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
              { value: null, name: 'No repeat' },
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
                :key="day"
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
              <fwb-table-head-cell class="text-right"></fwb-table-head-cell>
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
                  <fwb-button
                    color="red"
                    @click.prevent="() => calendar.form.users.splice(index, 1)"
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
          <FwbButton
            color="yellow"
            class="ml-4"
            @click="openCall"
            v-if="calendar.form.has_video && calendar.videoCall.slug"
            >Start call
          </FwbButton>
        </div>
        <interactive-toast>
          <template #trigger>
            <FwbButton color="red" class="ml-auto">Delete</FwbButton>
          </template>
          <template #title>You are about to delete event</template>
          <template #content>Are you sure you want to delete event?</template>
          <template #actions>
            <FwbButton color="red" @click="calendar.deleteEvent" size="xs"
              >Yes, Delete it</FwbButton
            >
          </template>
        </interactive-toast>
      </div>
    </template>
  </Modal>
</template>

<style scoped></style>
