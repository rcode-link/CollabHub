<template>
  <tippy
    allow-h-t-m-l
    interactive
    :content="`
Title
<p class='text-lg'>${obj.summary}</p>
<p class='max-h-40 overflow-auto'>
Description: <br />
  ${obj.description ?? '<br/>'}</p>
Start time: ${DateTime.fromISO(obj.start_time).toLocaleString(
      DateTime.DATETIME_SHORT
    )} <br /> End time: ${DateTime.fromISO(obj.end_time).toLocaleString(
      DateTime.DATETIME_SHORT
    )}`"
  >
    <fwb-badge
      @click="
        () => {
          if (obj.user_id === userStore.user.id) {
            calendar.setItem(obj);
            calendar.isModalVisible = true;
            return;
          }
          router.push({
            query: {
              event: obj.id,
            },
          });
        }
      "
      :type="badgeType"
      class="cursor-pointer hover:underline overflow-hidden text-left"
    >
      <span v-if="myStatus()" class="mr-4">&#10003;</span>
      {{ obj.summary }}
    </fwb-badge>
  </tippy>
</template>
<script setup>
import { Tippy } from "vue-tippy";
import { find } from "lodash";
import { DateTime } from "luxon";
import { useUserStore } from "../../../../../store/user";
import { useCalendarStore } from "../../../../../store/calendarStore";
import { computed } from "vue";
import { FwbBadge } from "flowbite-vue";
import { useRouter } from "vue-router";
const calendar = useCalendarStore();

const router = useRouter();
const userStore = useUserStore();
const props = defineProps({
  obj: {},
});
const badgeType = computed(() => {
  if (props.obj.type === "event" && props.obj.user_id !== userStore.user.id) {
    return "default";
  }

  if (props.obj.type === "event") {
    return "green";
  }

  if (props.obj.approved) {
    return "purple";
  }

  return "red";
});

const myStatus = () => {
  const me = find(props.obj.attendance, { id: userStore.user.id });
  return me?.attending;
};
</script>
<style scoped>
.calendar-card > button {
  @apply opacity-0;
}

.calendar-card:hover > button {
  @apply opacity-100;
}
</style>
