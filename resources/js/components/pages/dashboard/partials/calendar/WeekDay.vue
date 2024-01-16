<script setup>
import {useCalendarStore} from "../../../../../store/calendarStore.js";
import CalendarItem from "./CalendarItem.vue";

const calendar = useCalendarStore();
defineProps({
    day: null,
    isToday: false,
    events: [],
})

</script>

<template>
    <div class="calendar-card">
    <div :class="`sticky top-0 z-10  ${isToday ? 'bg-gray-300 dark:bg-gray-500' : 'bg-gray-100 dark:bg-gray-700'} flex justify-between items-center px-2`"
    >
      {{ day }}
    </div>
        <div :class="`flex flex-col gap-2 px-2`">
      <template v-for="obj in events.sort(function(a,b){
  return new Date(b.start_time) - new Date(a.start_time);
})">
          <CalendarItem :obj="obj"/>
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
