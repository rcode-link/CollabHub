<script setup>
import {useCalendarStore} from "../../../../../store/calendarStore.js";
import {FwbBadge} from "flowbite-vue";
import {Tippy} from "vue-tippy";
import {DateTime} from "luxon";

const calendar = useCalendarStore();
defineProps({
  day: null,
  events: [],
})

</script>

<template>
  <div class="calendar-card">
    <div class="sticky top-0 z-10  bg-gray-100 dark:bg-gray-700 flex justify-between items-center px-2"
    >
      {{ day }}
    </div>
    <div class="flex flex-col gap-2 px-2">
      <template v-for="obj in events.sort(function(a,b){
  return new Date(b.start_time) - new Date(a.start_time);
})">
        <tippy allow-h-t-m-l interactive :content="`
Title
<p class='text-lg'>${obj.summary}</p>
Description:
<p class='max-h-40 overflow-auto'>${obj.description}</p>
Start time: ${DateTime.fromISO(obj.start_time).toLocaleString(DateTime.DATETIME_SHORT)} <br /> End time: ${DateTime.fromISO(obj.end_time).toLocaleString(DateTime.DATETIME_SHORT)}`">
          <fwb-badge @click="() => {calendar.setItem(obj);calendar.isModalVisible = true }"
                     class="cursor-pointer hover:underline overflow-hidden text-left"
          >
            {{ obj.summary }}
          </fwb-badge>
        </tippy>
      </template>
    </div>
  </div>
</template>

<style scoped>
.calendar-card {
  @apply border aspect-video hover:bg-gray-50 dark:hover:bg-gray-700 flex flex-col overflow-auto;
}

.calendar-card > button {
  @apply opacity-0
}

.calendar-card:hover > button {
  @apply opacity-100
}
</style>
