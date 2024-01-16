<script setup>
import CreateChat from "./CreateChat.vue";
import Card from "../../../shared/Card.vue";
import { FwbButton } from "flowbite-vue";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import SquaresIcon from "../../../shared/icons/SquaresIcon.vue";
import ChatIcon from "../../../shared/icons/ChatIcon.vue";
import UsersIcon from "../../../shared/icons/UsersIcon.vue";
import ArrowDownTray from "../../../shared/icons/ArrowDownTray.vue";
const router = useRouter();
const route = useRoute();
const changeChatFilter = (type) => {
  const routeQuery = {
    ...route.query,
    type: type,
  };
  router.push({
    query: routeQuery,
  });
};
const activeTab = computed(() => {
  if (["user", "group", "system"].indexOf(route.query.type) === -1) {
    return "all";
  }

  return route.query.type;
});
</script>

<template>
  <Card class="gap-4 sticky top-0 bg-white dark:bg-grey-700 z-10">
    <fwb-button
      :color="activeTab === 'all' ? 'default' : 'dark'"
      outline
      square
      @click="() => changeChatFilter('none')"
    >
      <SquaresIcon class="w-6 h-6" />
    </fwb-button>
    <fwb-button
      :color="activeTab === 'user' ? 'default' : 'dark'"
      outline
      square
      @click="() => changeChatFilter('user')"
    >
      <ChatIcon class="w-6 h-6" />
    </fwb-button>
    <fwb-button
      :color="activeTab === 'group' ? 'default' : 'dark'"
      outline
      square
      @click="() => changeChatFilter('group')"
    >
      <UsersIcon class="w-6 h-6" />
    </fwb-button>
    <fwb-button
      :color="activeTab === 'system' ? 'default' : 'dark'"
      outline
      square
      @click="() => changeChatFilter('system')"
    >
      <ArrowDownTray class="w-6 h-6" />
    </fwb-button>
    <span class="ml-auto">
      <slot></slot>
    </span>
  </Card>
</template>

<style scoped>
</style>
