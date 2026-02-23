<script setup>
import { useAbility } from '@casl/vue'
import { useRoute, useRouter } from 'vue-router'
import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import Editor from '@/components/shared/Editor.vue'
import User from '@/components/pages/project/tasks/User.vue'
import { TailwindPagination } from 'laravel-vue-pagination'
import Text from '@/components/shared/Text.vue'
import Label from '@/components/shared/Label.vue'
import UsersSelectInput from '@/components/shared/SelectUsersInProject.vue'
import _ from 'lodash'
import { DateTime } from 'luxon'
import { useBreadcrumbStore } from '@/store/breadcrumb'
import { useTasksStore } from '@/store/tasksStore.js'

const route = useRoute()
const router = useRouter()
const { can } = useAbility()

const taskTypesList = ref([])
const statuses = ref([])
const tasksStore = useTasksStore()
const breadcrumbStore = useBreadcrumbStore()

const form = reactive({
  type_id: null,
  search: null,
  status_id: null,
  user_id: null,
  tag: null,
  page: 1,
})

const load = () => {
  const withoutNulls = _.omitBy(route.query, _.isNull)
  withoutNulls.project_id = route.params.project
  tasksStore.loadTasks(withoutNulls)
}

const initData = () => {
  axios
    .get(`/api/v1/tasks-statuses/`, { params: { project_id: route.params.project } })
    .then((res) => { statuses.value = res.data.data })

  axios.get('/api/v1/task-types').then((res) => { taskTypesList.value = res.data })

  Echo.private(`task-updated.${route.params.project}`).listen('TaskUpdatedEvent', ({ task }) => {
    const index = _.findIndex(tasksStore.tasks.data, { id: _.toNumber(task.id) })
    if (index > -1) { tasksStore.tasks.data.splice(index, 1, task) }
  })
}

watch(
  () => form,
  () => { router.push({ query: { ...route.query, ...form } }) },
  { deep: true }
)

const timeOut = ref(null)
watch(
  () => route.query,
  () => {
    clearTimeout(timeOut.value)
    timeOut.value = setTimeout(() => load(), 300)
  },
  { immediate: true }
)

onMounted(() => {
  form.search = route.query.search
  form.page = route.query.page
  form.user_id = route.query.user_id
  form.type_id = route.query.type_id
  form.status_id = route.query.status_id
  form.tag = route.query.tag ?? null

  initData()
  breadcrumbStore.addEntry([{ link: '', title: 'Tasks' }])
})

onBeforeUnmount(() => { breadcrumbStore.addEntry([]) })

const openTask = (obj) => {
  router.push({ ...route, query: { ...route.query, task: obj.task_id } })
}

const selectClass = 'w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500'
</script>

<template>
  <div class="flex flex-col gap-4 pb-2">
    <!-- Filters -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      <!-- Search -->
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          v-model="form.search"
          type="text"
          placeholder="Search tasks…"
          :class="[selectClass, 'pl-9']"
        />
      </div>
      <!-- Type -->
      <select v-model="form.type_id" :class="selectClass">
        <option :value="null">All types</option>
        <option v-for="obj in taskTypesList" :key="obj.id" :value="obj.id">{{ obj.title }}</option>
      </select>
      <!-- Status -->
      <select v-model="form.status_id" :class="selectClass">
        <option :value="null">All statuses</option>
        <option v-for="obj in statuses" :key="obj.id" :value="obj.id">{{ obj.title }}</option>
      </select>
      <!-- Assignee -->
      <UsersSelectInput :key="form.user_id" v-model="form.user_id" :show-clean-input="true" />
      <!-- Tag -->
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
        </svg>
        <input
          v-model="form.tag"
          type="text"
          placeholder="Filter by tag…"
          :class="[selectClass, 'pl-9 pr-8']"
          :style="form.tag ? 'border-color: #3b82f6; background: rgba(59,130,246,.06);' : ''"
        />
        <button
          v-if="form.tag"
          @click="form.tag = null"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Task table -->
    <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-100 dark:border-gray-800 text-left">
            <th class="px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Id</th>
            <th class="px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Task</th>
            <th class="px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden lg:table-cell">Description</th>
            <th class="px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Relations</th>
            <th class="px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tags</th>
            <th class="px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Type</th>
            <th class="px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">User</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50 dark:divide-gray-800/50">
          <tr
            v-for="obj in tasksStore.tasks.data"
            :key="JSON.stringify(obj)"
            class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            @click="openTask(obj)"
          >
            <td class="px-4 py-2.5">
              <router-link
                :to="{ ...route, query: { ...route.query, task: obj.task_id } }"
                class="text-xs text-blue-600 dark:text-blue-400 font-medium no-underline"
                @click.stop
              >{{ obj.task_id }}</router-link>
            </td>
            <td class="px-4 py-2.5">
              <div class="font-medium text-gray-900 dark:text-white">{{ obj.name }}</div>
              <div v-if="obj.due_date" class="text-xs text-gray-400 mt-0.5">
                {{ DateTime.fromISO(obj.due_date).toLocaleString(DateTime.DATE_SHORT) }}
              </div>
            </td>
            <td class="px-4 py-2.5 hidden lg:table-cell max-w-xs">
              <Editor :model="obj.description" class="h-4 overflow-hidden text-xs text-gray-500" :editable="false" />
            </td>
            <td class="px-4 py-2.5 text-gray-500 dark:text-gray-400">{{ obj.children_count }}</td>
            <td class="px-4 py-2.5" @click.stop>
              <div class="flex gap-1 flex-wrap">
                <button
                  v-for="(str, index) in obj.tags"
                  :key="index"
                  type="button"
                  @click="form.tag = form.tag === str ? null : str"
                  class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium transition-colors"
                  :class="form.tag === str
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 ring-1 ring-blue-300 dark:ring-blue-700'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-400'"
                  :title="form.tag === str ? 'Clear tag filter' : 'Filter by this tag'"
                >{{ str }}</button>
              </div>
            </td>
            <td class="px-4 py-2.5">
              <span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {{ obj.type.title }}
              </span>
            </td>
            <td class="px-4 py-2.5" @click.stop>
              <User :show-name="false" :user="obj.user" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <TailwindPagination :limit="3" :data="tasksStore.tasks" @pagination-change-page="(page) => (form.page = page)" />
  </div>
</template>
