<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const board = ref(null)
const error = ref(null)

onMounted(() => {
  axios.get(`/api/v1/shared/b/${route.params.token}`)
    .then(({ data }) => { board.value = data })
    .catch(() => { error.value = true })
})
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">

    <!-- Loading -->
    <div v-if="!board && !error" class="flex items-center justify-center min-h-screen">
      <div class="flex flex-col items-center gap-3 text-gray-400">
        <svg class="w-6 h-6 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="15 45" stroke-linecap="round"/>
        </svg>
        <span class="text-sm">Loading board...</span>
      </div>
    </div>

    <!-- Not found -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <p class="text-4xl font-bold text-gray-200 dark:text-gray-700 mb-2">404</p>
        <p class="text-sm text-gray-400">This board is not available or the link has expired.</p>
      </div>
    </div>

    <!-- Board content -->
    <div v-else class="px-6 py-8">
      <!-- Header -->
      <div class="max-w-7xl mx-auto mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ board.title }}</h1>
        <div class="flex items-center gap-3 mt-1">
          <span class="text-xs font-medium uppercase tracking-wide px-2 py-0.5 rounded-full"
                :class="board.type === 'scrum'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'">
            {{ board.type }}
          </span>
          <span v-if="board.sprint" class="text-xs text-gray-500 dark:text-gray-400">
            {{ board.sprint.title }}
          </span>
        </div>
      </div>

      <!-- Empty board -->
      <div v-if="!board.statuses?.length" class="flex items-center justify-center py-20">
        <p class="text-sm text-gray-400">This board has no statuses yet.</p>
      </div>

      <!-- Kanban columns -->
      <div v-else class="flex gap-4 overflow-x-auto pb-4 max-w-7xl mx-auto">
        <div
          v-for="status in board.statuses"
          :key="status.id"
          class="flex-shrink-0 w-[272px] flex flex-col"
          style="max-height: calc(100vh - 180px)"
        >
          <!-- Column header -->
          <div class="flex items-center justify-between px-1 py-2 mb-1.5 flex-shrink-0">
            <div class="flex items-center gap-2">
              <div
                class="w-2 h-2 rounded-full flex-shrink-0"
                :style="status.color ? { backgroundColor: status.color } : {}"
                :class="!status.color && 'bg-gray-300 dark:bg-gray-600'"
              ></div>
              <h3 class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {{ status.title }}
              </h3>
            </div>
            <span v-if="status.tasks?.length" class="text-xs text-gray-400 dark:text-gray-500 tabular-nums font-medium">
              {{ status.tasks.length }}
            </span>
          </div>

          <!-- Task list -->
          <div class="flex-1 overflow-y-auto space-y-2 pb-4 rounded-xl bg-gray-50/60 dark:bg-gray-800/30 min-h-[60px]" style="padding: 6px">
            <div
              v-for="task in status.tasks"
              :key="task.id"
              class="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 shadow-sm"
            >
              <!-- Task ID + type -->
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-medium text-gray-400 dark:text-gray-500">{{ task.task_id }}</span>
                <span v-if="task.type" class="text-xs text-gray-400 dark:text-gray-500">{{ task.type.title }}</span>
              </div>

              <!-- Task name -->
              <p class="text-sm font-medium text-gray-900 dark:text-white leading-snug">{{ task.name }}</p>

              <!-- Footer: tags + assignee + due date -->
              <div class="flex items-center gap-2 mt-2 flex-wrap">
                <span
                  v-for="tag in (task.tags || [])"
                  :key="tag"
                  class="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                >{{ tag }}</span>

                <span v-if="task.due_date" class="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                  {{ new Date(task.due_date).toLocaleDateString() }}
                </span>

                <span v-if="task.user" class="text-xs text-gray-500 dark:text-gray-400 ml-auto flex items-center gap-1">
                  <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  {{ task.user.name }}
                </span>
              </div>
            </div>

            <!-- Empty column -->
            <div
              v-if="!status.tasks?.length"
              class="flex items-center justify-center h-16 text-xs text-gray-400 dark:text-gray-500"
            >
              No tasks
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
