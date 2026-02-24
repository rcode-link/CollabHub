<script setup>
import { ref } from 'vue'
import Card from '@/components/shared/Card.vue'
import UserIcon from '@/components/shared/UserIcon.vue'
import Badge from '@/components/shared/ui/Badge.vue'
import { DateTime } from 'luxon'

const tasks = ref([])
const loadMyTasks = () => {
  window.axios.get('/api/v1/dashboard/tasks').then((res) => {
    tasks.value = res.data.data
  })
}
loadMyTasks()
</script>

<template>
  <Card>
    <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
      <h3 class="text-sm font-semibold text-gray-900 dark:text-white">My Tasks</h3>
    </div>
    <div v-if="tasks.length === 0" class="px-4 py-8 text-center">
      <p class="text-sm text-gray-500 dark:text-gray-400">No open tasks assigned to you</p>
    </div>
    <table v-else class="w-full">
      <thead>
        <tr class="border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/60 text-left">
          <th class="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Type</th>
          <th class="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 w-16">ID</th>
          <th class="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Task</th>
          <th class="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 hidden md:table-cell w-28">Status</th>
          <th class="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 hidden lg:table-cell w-28">Board</th>
          <th class="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 w-12"></th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-50 dark:divide-gray-700/40">
        <tr
          v-for="obj in tasks"
          :key="obj.id"
          class="hover:bg-blue-50/40 dark:hover:bg-gray-700/30 transition-colors"
        >
          <td class="px-3 py-2">
            <Badge color="purple" size="xs">{{ obj.type?.title }}</Badge>
          </td>
          <td class="px-3 py-2">
            <span class="text-[11px] font-mono font-medium text-gray-500 dark:text-gray-400">{{ obj.task_id }}</span>
          </td>
          <td class="px-3 py-2">
            <div class="flex items-center gap-2 min-w-0">
              <span class="text-xs font-medium text-gray-900 dark:text-white truncate">{{ obj.name }}</span>
              <span v-if="obj.due_date" class="flex-shrink-0 text-[10px] text-gray-400 tabular-nums">
                {{ DateTime.fromISO(obj.due_date).toLocaleString(DateTime.DATE_MED) }}
              </span>
            </div>
          </td>
          <td class="px-3 py-2 hidden md:table-cell">
            <div v-if="obj.status" class="flex items-center gap-1.5">
              <div class="w-2 h-2 rounded-full flex-shrink-0" :style="{ backgroundColor: obj.status.color || '#6B7280' }"></div>
              <span class="text-xs text-gray-600 dark:text-gray-400 truncate">{{ obj.status.title }}</span>
            </div>
            <span v-else class="text-xs text-gray-300 dark:text-gray-600">—</span>
          </td>
          <td class="px-3 py-2 hidden lg:table-cell">
            <span v-if="obj.status?.board" class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ obj.status.board.title }}</span>
            <span v-else class="text-xs text-gray-300 dark:text-gray-600">—</span>
          </td>
          <td class="px-3 py-2">
            <router-link
              :to="{ name: 'project.tasks', params: { project: obj.project_id }, query: { task: obj.task_id } }"
              class="text-[11px] text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
            >Open</router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </Card>
</template>
