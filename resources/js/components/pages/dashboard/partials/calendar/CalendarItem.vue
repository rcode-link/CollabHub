<template>
  <tippy
    allow-h-t-m-l
    interactive
    :content="`
Title
<p class='text-lg'>${obj.summary}</p>
Description:
<p class='max-h-40 overflow-auto'>${obj.description}</p>
Start time: ${DateTime.fromISO(obj.start_time).toLocaleString(
      DateTime.DATETIME_SHORT
    )} <br /> End time: ${DateTime.fromISO(obj.end_time).toLocaleString(
      DateTime.DATETIME_SHORT
    )}`"
  >
    <fwb-badge
      @click="
        () => {
          calendar.setItem(obj);
          calendar.isModalVisible = true;
        }
      "
      :type="badgeType"
      class="cursor-pointer hover:underline overflow-hidden text-left"
    >
      {{ obj.summary }}
    </fwb-badge>
  </tippy>
</template>
<script setup lang="ts">
import { Tippy } from "vue-tippy";
import { DateTime } from "luxon";
import { useCalendarStore } from "../../../../../store/calendarStore.js";
import { computed } from "vue";
import { FwbBadge } from "flowbite-vue";
import { EventResource } from "../../../../../types/models/EventResource.js";
const calendar = useCalendarStore();

const props = defineProps<{
  obj: EventResource;
}>();
const badgeType = computed(() => {
  if (props.obj.type === "event") {
    return "default";
  }

  if (props.obj.approved) {
    return "purple";
  }

  return "red";
});
</script>
<style scoped>
.calendar-card > button {
  @apply opacity-0;
}

.calendar-card:hover > button {
  @apply opacity-100;
}
</style>
