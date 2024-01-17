<template>
  <router-link
    :to="goToRoute()"
    class="custom-list-item gap-2 mb-2 mt-2 items-center text-gray-900 dark:text-white"
  >
    <UserIcon
      v-if="['user', 'group'].indexOf(obj.type) > -1"
      :user="obj"
      class="min-w-10"
    />
    <template v-else>
      <Task v-if="obj.type === 'app\\models\\task'" class="w-10 h-10" />
      <fwb-avatar
        v-if="obj.type === 'app\\models\\company'"
        class="w-10 h-10"
        :img="userStore.company.avatar"
      />
      <EarthIcon v-if="obj.type === 'app\\models\\event'" class="w-10 h-10" />
    </template>
    <div class="col-span-5 text-gray-900 dark:text-white">
      <div class="flex">
        {{ obj.title }}
        <div
          v-if="obj.unreadMessages"
          class="w-6 h-6 ml-auto bg-red-700 text-white flex justify-center items-center rounded-full text-center font-bold p-2 mr-3"
        >
          {{ obj.unreadMessages }}
        </div>
      </div>
      <div
        v-if="obj.message !== null"
        :key="JSON.stringify(obj.message)"
        class="text-xs grid grid-cols-6 gap-1"
      >
        <div class="col-span-5 h-4 flex gap-4 overflow-hidden">
          {{ obj.message.user }}: {{ obj.message.text }}
        </div>
        <div class="col-span-1">
          <div v-if="daysAgo === 0">
            {{
              DateTime.fromISO(obj.message.created_at).toLocaleString(
                DateTime.TIME_SIMPLE
              )
            }}
          </div>
          <div v-if="daysAgo === 1">{{ daysAgo }} day ago</div>
          <div v-if="daysAgo > 1">{{ daysAgo }} days ago</div>
        </div>
      </div>
    </div>
  </router-link>
</template>
<script setup>
import { DateTime } from "luxon";
import { computed } from "vue";
import { useRoute } from "vue-router";
import UserIcon from "../../../shared/UserIcon.vue";
import Task from "../../../shared/icons/Task.vue";
import { FwbAvatar } from "flowbite-vue";
import { useUserStore } from "../../../../store/user";
import EarthIcon from "../../../shared/icons/EarthIcon.vue";

const userStore = useUserStore();
const route = useRoute();
const props = defineProps({
  obj: {},
});

const goToRoute = () => {
  const queryData = {
    query: route.query,
    params: {
      chatId: props.obj.id,
    },
  };
  return {
    name: "chat-details",
    ...queryData,
  };
};

const daysAgo = computed(() => {
  return DateTime.now()
    .startOf("day")
    .diff(DateTime.fromISO(props.obj.message.created_at).startOf("day"), [
      "hours",
      "days",
    ]).days;
});
</script>
<style scoped>
.custom-list-item {
  display: grid;
  grid-template-columns: repeat(6, minmax(2.5rem, 1fr));
}
</style>
