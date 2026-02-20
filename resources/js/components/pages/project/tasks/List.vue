<script setup>
import { useAbility } from '@casl/vue'
import { useRoute, useRouter } from 'vue-router'
import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import Editor from '../../../shared/Editor.vue'
import User from './User.vue'
import { TailwindPagination } from 'laravel-vue-pagination'
import Text from '../../../shared/Text.vue'
import Label from '../../../shared/Label.vue'
import UsersSelectInput from '../../../shared/SelectUsersInProject.vue'
import _ from 'lodash'
import { DateTime } from 'luxon'
import { useBreadcrumbStore } from '../../../../store/breadcrumb'
import { useTasksStore } from '../../../../store/tasksStore.js'

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
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <Label>Title or Description</Label>
        <Text v-model="form.search" />
      </div>
      <div>
        <Label>Type</Label>
        <select v-model="form.type_id" :class="selectClass">
          <option :value="null">All types</option>
          <option v-for="obj in taskTypesList" :key="obj.id" :value="obj.id">{{ obj.title }}</option>
        </select>
      </div>
      <div>
        <Label>Status</Label>
        <select v-model="form.status_id" :class="selectClass">
          <option :value="null">All statuses</option>
          <option v-for="obj in statuses" :key="obj.id" :value="obj.id">{{ obj.title }}</option>
        </select>
      </div>
      <div>
        <Label>By assigned user</Label>
        <UsersSelectInput :key="form.user_id" v-model="form.user_id" :show-clean-input="true" />
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
            <td class="px-4 py-2.5">
              <div class="flex gap-1 flex-wrap">
                <span
                  v-for="(str, index) in obj.tags"
                  :key="index"
                  class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                >{{ str }}</span>
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
