<script setup>
import { useRoute } from "vue-router";

const route = useRoute();
defineProps({
  tasks: [],
});
</script>

<template>
  <div class="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
    <!-- Desktop header -->
    <div class="hidden lg:grid grid-cols-[80px_60px_1fr_100px_100px_80px] gap-2 px-3 py-1.5 bg-gray-50/80 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-700">
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
        class="hover:bg-blue-50/40 dark:hover:bg-gray-700/30 transition-colors"
      >
        <!-- Desktop row -->
        <div class="hidden lg:grid grid-cols-[80px_60px_1fr_100px_100px_80px] gap-2 px-3 py-2 items-center">
          <div class="flex flex-col">
            <span class="text-[10px] font-medium" :class="obj.relation?.direction === 'parent' ? 'text-blue-500' : 'text-orange-500'">
              {{ obj.relation?.direction === 'parent' ? 'Parent' : 'Child' }}
            </span>
            <span class="text-[10px] text-gray-400 dark:text-gray-500 truncate">{{ obj.relation?.name }}</span>
          </div>

          <router-link
            :to="{ ...route, query: { ...route.query, task: obj.task_id } }"
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
            :style="obj.type.colour ? { backgroundColor: obj.type.colour + '1a', color: obj.type.colour } : {}"
            :class="!obj.type.colour && 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'"
          >
            <span v-if="obj.type.colour" class="w-2 h-2 rounded-full flex-shrink-0" :style="{ backgroundColor: obj.type.colour }"></span>
            {{ obj.type.title }}
          </span>
        </div>

        <!-- Mobile card -->
        <router-link
          :to="{ ...route, query: { ...route.query, task: obj.task_id } }"
          class="lg:hidden flex items-center gap-3 px-3 py-2.5"
        >
          <span
            class="text-[10px] font-semibold uppercase w-12 flex-shrink-0 text-center"
            :class="obj.relation?.direction === 'parent' ? 'text-blue-500' : 'text-orange-500'"
          >{{ obj.relation?.direction === 'parent' ? 'Parent' : 'Child' }}</span>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-[11px] font-mono text-blue-600 dark:text-blue-400 flex-shrink-0">{{ obj.task_id }}</span>
              <span class="text-xs font-medium text-gray-900 dark:text-white truncate">{{ obj.name }}</span>
            </div>
            <div class="flex items-center gap-2 mt-0.5">
              <span v-if="obj.relation?.name" class="text-[10px] text-gray-400 dark:text-gray-500">{{ obj.relation.name }}</span>
              <div v-if="obj.status && !Array.isArray(obj.status)" class="flex items-center gap-1">
                <div class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: obj.status.color || '#6B7280' }"></div>
                <span class="text-[10px] text-gray-500 dark:text-gray-400">{{ obj.status.title }}</span>
              </div>
              <span
                v-if="obj.type?.title"
                class="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                :style="obj.type.colour ? { backgroundColor: obj.type.colour + '1a', color: obj.type.colour } : {}"
                :class="!obj.type.colour && 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'"
              >{{ obj.type.title }}</span>
            </div>
          </div>

          <svg class="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
          </svg>
        </router-link>
      </div>
    </div>
  </div>
</template>
