<script setup>
import { useRoute } from "vue-router";

const route = useRoute();
defineProps({
  tasks: [],
});
</script>

<template>
  <div class="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
    <!-- Header -->
    <div class="grid grid-cols-[80px_60px_1fr_100px_100px_80px] gap-2 px-3 py-1.5 bg-gray-50/80 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-700">
      <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Relation</span>
      <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">ID</span>
      <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Task</span>
      <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Status</span>
      <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Board</span>
      <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Type</span>
    </div>

    <!-- Rows -->
    <div class="divide-y divide-gray-50 dark:divide-gray-700/40">
      <div
        v-for="obj in tasks"
        :key="obj.id"
        class="grid grid-cols-[80px_60px_1fr_100px_100px_80px] gap-2 px-3 py-2 items-center hover:bg-blue-50/40 dark:hover:bg-gray-700/30 transition-colors"
      >
        <span class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ obj.relation?.name }}</span>

        <router-link
          :to="{ ...route, query: { ...route.query, task: obj.id } }"
          class="text-[11px] font-mono font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >{{ obj.task_id }}</router-link>

        <span class="text-xs font-medium text-gray-900 dark:text-white truncate">{{ obj.name }}</span>

        <div v-if="obj.status && !Array.isArray(obj.status)" class="flex items-center gap-1.5">
          <div class="w-2 h-2 rounded-full flex-shrink-0" :style="{ backgroundColor: obj.status.color || '#6B7280' }"></div>
          <span class="text-xs text-gray-600 dark:text-gray-400 truncate">{{ obj.status.title }}</span>
        </div>
        <span v-else class="text-xs text-gray-300 dark:text-gray-600">—</span>

        <span v-if="obj.status?.board" class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ obj.status.board.title }}</span>
        <span v-else class="text-xs text-gray-300 dark:text-gray-600">—</span>

        <span
          v-if="obj.type?.title"
          class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium"
          :style="obj.type.colour ? {
            backgroundColor: obj.type.colour + '1a',
            color: obj.type.colour,
          } : {}"
          :class="!obj.type.colour && 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'"
        >
          <span
            v-if="obj.type.colour"
            class="w-2 h-2 rounded-full flex-shrink-0"
            :style="{ backgroundColor: obj.type.colour }"
          ></span>
          {{ obj.type.title }}
        </span>
      </div>
    </div>
  </div>
</template>
