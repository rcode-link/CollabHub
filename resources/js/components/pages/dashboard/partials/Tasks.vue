<script setup>
import { ref } from 'vue'
import Card from '@/components/shared/Card.vue'
import User from '../../project/tasks/User.vue'
import Editor from '../../../shared/Editor.vue'
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
    <table v-else class="w-full text-sm">
      <thead>
        <tr class="border-b border-gray-100 dark:border-gray-800 text-left">
          <th class="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Id</th>
          <th class="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Task</th>
          <th class="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden lg:table-cell">Description</th>
          <th class="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Type</th>
          <th class="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">User</th>
          <th class="px-4 py-2"></th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-50 dark:divide-gray-800/50">
        <tr
          v-for="obj in tasks"
          :key="obj.id"
          class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <td class="px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400">{{ obj.task_id }}</td>
          <td class="px-4 py-2.5">
            <div class="font-medium text-gray-900 dark:text-white">{{ obj.name }}</div>
            <div v-if="obj.due_date" class="text-xs text-gray-400 mt-0.5">
              {{ DateTime.fromISO(obj.due_date).toLocaleString(DateTime.DATE_SHORT) }}
            </div>
          </td>
          <td class="px-4 py-2.5 hidden lg:table-cell max-w-xs">
            <Editor :model="obj.description" class="h-4 overflow-hidden text-xs text-gray-500" :editable="false" />
          </td>
          <td class="px-4 py-2.5">
            <span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              {{ obj.type.title }}
            </span>
          </td>
          <td class="px-4 py-2.5">
            <User :show-name="false" :user="obj.user" />
          </td>
          <td class="px-4 py-2.5">
            <router-link
              :to="{ name: 'project.tasks', params: { project: obj.project_id }, query: { task: obj.task_id } }"
              class="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400 no-underline font-medium"
            >Open →</router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </Card>
</template>
