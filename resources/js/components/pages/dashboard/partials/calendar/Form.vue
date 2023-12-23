<script setup>

import Modal from "../../../../shared/Modal.vue";
import Label from "../../../../shared/Label.vue";
import Text from "../../../../shared/Text.vue";
import DatePicker from "../../../../shared/DatePicker.vue";
import {useCalendarStore} from "../../../../../store/calendarStore.js";
import {
  FwbButton,
  FwbCheckbox,
  FwbSelect,
  FwbTable,
  FwbTableBody,
  FwbTableCell, FwbTableHead,
  FwbTableHeadCell,
  FwbTableRow
} from "flowbite-vue";
import Errors from "../../../../shared/Errors.vue";
import SelectUsersInCompany from "../../../../shared/SelectUsersInCompany.vue";
import AddUserToProject from "../../../project/settings/AddUserToProject.vue";
import UserIcon from "../../../../shared/UserIcon.vue";
import TrashIcon from "../../../../shared/icons/TrashIcon.vue";

const calendar = useCalendarStore();
const byDay = [
  {
    'value': 'MO',
    'label': 'Monday'
  },
  {
    'value': 'TU',
    'label': 'Tuesday'
  },
  {
    'value': 'WE',
    'label': 'Wednesday'
  },
  {
    'value': 'TH',
    'label': 'Thursday'
  },
  {
    'value': 'FR',
    'label': 'Friday'
  },
  {
    'value': 'SA',
    'label': 'Saturday'
  },
  {
    'value': 'SU',
    'label': 'Sunday'
  },
]

</script>

<template>
  <Modal :hide-modal="calendar.isModalVisible" @closed="calendar.closeModal">
    <template #header>
      <h1>
        <template v-if="calendar.form.id">
          Event details
        </template>
        <template v-else>
          Create new event
        </template>
      </h1>
    </template>
    <template #body>
      <form @submit.prevent="calendar.save" class="flex flex-col gap-4">
        <div>
          <Label forInput="summary">Title</Label>
          <Text v-model="calendar.form.summary"/>
          <Errors name="summary"/>

        </div>
        <div>
          <Label forInput="description">Description</Label>
          <textarea
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              v-model="calendar.form.description"/>
          <Errors name="description"/>
        </div>
        <div>
          <Label forInput="start_time">Start</Label>
          <DatePicker v-model="calendar.form.start_time" :name="'start_time'" enable-time="true"/>
          <Errors name="start_time"/>
        </div>
        <div>
          <Label forInput="end_time">End</Label>
          <DatePicker v-model="calendar.form.end_time" :name="'end_time'" enable-time="true"/>
          <Errors name="end_time"/>
        </div>
        <fwb-select
            v-model="calendar.form.freq"
            :options="[{value: null, name: 'No repeat'}, {value: 'WEEKLY', name: 'WEEKLY'}, {value: 'DAILY', name: 'DAILY'}]"
            label="Repeating"
        />
        <div v-if="calendar.form.freq">
          <Label>Repeat Until</Label>
          <DatePicker v-model="calendar.form.freq_until"/>
          <Errors name="freq_until"/>

        </div>
        <template v-if="calendar.form.freq === 'WEEKLY'">
          <div>
            <Label>Repeat on days</Label>
            <fwb-checkbox v-for="day in byDay" :label="day.label" v-model="calendar.form.freq_settings[day.value]"/>
          </div>
        </template>
        <SelectUsersInCompany @selected-user="(obj) => calendar.form.users.push(obj)" />
        <fwb-table hoverable>
          <fwb-table-head>
            <fwb-table-head-cell></fwb-table-head-cell>
            <fwb-table-head-cell>Name</fwb-table-head-cell>
            <fwb-table-head-cell>Email</fwb-table-head-cell>
            <fwb-table-head-cell class="text-right"></fwb-table-head-cell>
          </fwb-table-head>
          <fwb-table-body>
            <fwb-table-row v-for="(obj, index) in  calendar.form.users" :key="obj.id">
              <fwb-table-cell>
                <UserIcon :user="obj"/>
              </fwb-table-cell>
              <fwb-table-cell>
                {{ obj.name }}
              </fwb-table-cell>
              <fwb-table-cell>
                {{ obj.email }}
              </fwb-table-cell>
              <fwb-table-cell>
                <fwb-button color="red" @click.prevent="() => calendar.form.users.splice(index,1)"><TrashIcon class="w-4 h-4" /></fwb-button>
              </fwb-table-cell>
            </fwb-table-row>
          </fwb-table-body>
        </fwb-table>
      </form>
    </template>
    <template #footer>
      <FwbButton @click="calendar.save">Save</FwbButton>
    </template>
  </Modal>
</template>

<style scoped>

</style>
