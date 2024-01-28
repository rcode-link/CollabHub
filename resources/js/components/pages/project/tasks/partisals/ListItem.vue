<script setup>
import { FwbBadge } from "flowbite-vue";
import { useRoute, useRouter } from "vue-router";
import { isArray } from "lodash";
const route = useRoute();
defineProps({
  tasks: [],
});
</script>

<template>
  <div class="grid grid-cols-7 border-b font-bold p-1 gap-1">
    <div>Relation</div>
    <div>Id</div>
    <div class="col-span-3">Task</div>
    <div>Status</div>
    <div>Type</div>
  </div>
  <div
    v-for="obj in tasks"
    :key="obj"
    class="grid gap-1 grid-cols-7 items-center border-b p-1"
  >
    <div>
      {{ obj.relation.name }}
    </div>
    <div>
      <router-link
        :to="{
          ...route,
          query: {
            ...route.query,
            task: obj.id,
          },
        }"
      >
        {{ obj.task_id }}
      </router-link>
    </div>
    <div class="col-span-3">{{ obj.name }}</div>
    <div>
      <fwb-badge
        v-if="obj.status && !isArray(obj.status)"
        :type="obj.status?.open ? 'default' : 'green'"
        >{{ obj.status.title }}</fwb-badge
      >
    </div>
    <div>{{ obj.type.title }}</div>
  </div>
</template>

<style scoped>
</style>
