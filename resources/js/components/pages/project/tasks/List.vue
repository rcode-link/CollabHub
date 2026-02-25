<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import UserIcon from '@/components/shared/UserIcon.vue'
import Badge from '@/components/shared/ui/Badge.vue'
import UiSelect from '@/components/shared/ui/Select.vue'
import { TailwindPagination } from 'laravel-vue-pagination'
import { debounce } from '@/functions/debounce'
import { DateTime } from 'luxon'
import { useBreadcrumbStore } from '@/store/breadcrumb'
import { useTasksStore } from '@/store/tasksStore.js'
import { useDropdown } from '@/composables/useDropdown'

const route = useRoute()
const router = useRouter()

const taskTypesList = ref([])
const statuses = ref([])
const tasksStore = useTasksStore()
const breadcrumbStore = useBreadcrumbStore()
const loading = ref(true)

// User filter dropdown
const filterUsers = ref([])
const userSearch = ref('')
const { open: userOpen, el: userEl, toggle: toggleUser } = useDropdown()

const loadFilterUsers = debounce(() => {
  window.axios
    .get('/api/v1/users/project', { params: { user: userSearch.value, project_id: route.params.project } })
    .then((r) => { filterUsers.value = r.data.data ?? r.data })
}, 300)

watch(userSearch, loadFilterUsers, { immediate: true })

const selectedFilterUser = computed(() => filterUsers.value.find((u) => u.id === form.user_id))

const selectFilterUser = (user) => {
  form.user_id = user.id
  userOpen.value = false
  userSearch.value = ''
}

const form = reactive({
  type_id: '',
  search: '',
  status_id: '',
  user_id: null,
  tag: '',
  page: 1,
})

const hasActiveFilters = computed(() =>
  Boolean(form.search) || form.type_id !== '' || form.status_id !== '' || form.user_id !== null || Boolean(form.tag)
)

const clearFilters = () => {
  form.search = ''
  form.type_id = ''
  form.status_id = ''
  form.user_id = null
  form.tag = ''
}

const load = () => {
  loading.value = true
  const params = Object.fromEntries(Object.entries(route.query).filter(([, v]) => v != null && v !== ''))
  params.project_id = route.params.project
  tasksStore.loadTasks(params)
}

watch(() => tasksStore.tasks, () => { loading.value = false })

const initData = () => {
  axios
    .get(`/api/v1/tasks-statuses/`, { params: { project_id: route.params.project } })
    .then((res) => { statuses.value = res.data.data })

  axios.get('/api/v1/task-types').then((res) => { taskTypesList.value = res.data })

  Echo.private(`task-updated.${route.params.project}`).listen('TaskUpdatedEvent', ({ task }) => {
    const index = tasksStore.tasks.data.findIndex(t => t.id === Number(task.id))
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
  form.search = route.query.search || ''
  form.page = route.query.page || 1
  form.user_id = route.query.user_id || null
  form.type_id = route.query.type_id || ''
  form.status_id = route.query.status_id || ''
  form.tag = route.query.tag || ''

  initData()
  breadcrumbStore.addEntry([{ link: '', title: 'Backlog' }])
})

onBeforeUnmount(() => { breadcrumbStore.addEntry([]) })

const openTask = (obj) => {
  router.push({ ...route, query: { ...route.query, task: obj.task_id } })
}
</script>

<template>
  <div class="flex flex-col gap-2">

    <!-- Filter bar -->
    <div class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2">
      <div class="flex items-center gap-1.5 flex-wrap">
        <!-- Search -->
        <div class="relative flex-1 min-w-[140px] max-w-[200px]">
          <svg class="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            v-model="form.search"
            type="text"
            placeholder="Search…"
            class="w-full pl-7 pr-2 py-1 text-xs rounded-md border border-gray-200 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>

        <!-- Type -->
        <UiSelect v-model="form.type_id" class="!w-auto" size="sm">
          <option value="">All types</option>
          <option v-for="obj in taskTypesList" :key="obj.id" :value="obj.id">{{ obj.title }}</option>
        </UiSelect>

        <!-- Status -->
        <UiSelect v-model="form.status_id" class="!w-auto" size="sm">
          <option value="">All statuses</option>
          <option v-for="obj in statuses" :key="obj.id" :value="obj.id">{{ obj.title }}</option>
        </UiSelect>

        <!-- Assignee -->
        <div class="relative" ref="userEl">
          <button
            @click="toggleUser()"
            class="flex items-center gap-1 py-1 pl-2 pr-1.5 text-xs rounded-md border transition-colors"
            :class="form.user_id
              ? 'border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'"
          >
            <img v-if="selectedFilterUser?.avatar" :src="selectedFilterUser.avatar" class="w-4 h-4 rounded-full object-cover flex-shrink-0" />
            <span v-else-if="selectedFilterUser" class="w-4 h-4 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center flex-shrink-0 text-[8px] font-bold text-blue-700 dark:text-blue-300">{{ selectedFilterUser.name?.charAt(0).toUpperCase() }}</span>
            <svg v-else class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <span>{{ selectedFilterUser ? selectedFilterUser.name : 'Assignee' }}</span>
            <svg
              v-if="form.user_id"
              @click.stop="form.user_id = null"
              class="w-3 h-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              viewBox="0 0 20 20" fill="currentColor"
            >
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
            <svg v-else class="w-3 h-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
          <Transition name="dropdown">
            <div
              v-if="userOpen"
              class="absolute top-full left-0 mt-1 w-48 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg py-1 z-50"
            >
              <div class="px-1.5 pt-1 pb-0.5">
                <input
                  v-model="userSearch"
                  type="text"
                  placeholder="Search…"
                  class="w-full px-2 py-1 text-xs rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div class="max-h-40 overflow-y-auto">
                <button
                  v-for="u in filterUsers"
                  :key="u.id"
                  @click="selectFilterUser(u)"
                  class="flex items-center gap-1.5 w-full px-2.5 py-1.5 text-xs text-left transition-colors"
                  :class="form.user_id === u.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'"
                >
                  <UserIcon avatar-size="xs" :user="u" :status="false" />
                  <span class="truncate">{{ u.name }}</span>
                </button>
                <p v-if="!filterUsers.length" class="text-[10px] text-gray-400 px-2.5 py-1.5 text-center">No members</p>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Tag -->
        <div class="relative flex items-center">
          <svg class="absolute left-2 w-3 h-3 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
          <input
            v-model="form.tag"
            type="text"
            placeholder="Tag…"
            class="pl-7 pr-6 py-1 text-xs rounded-md border transition-colors w-24 focus:w-36"
            :class="form.tag
              ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
              : 'border-gray-200 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white placeholder-gray-400'"
            style="transition: width 0.2s ease, border-color 0.15s, background-color 0.15s;"
          />
          <button
            v-if="form.tag"
            @click="form.tag = null"
            class="absolute right-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <svg class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <!-- Clear -->
        <button
          v-if="hasActiveFilters"
          @click="clearFilters"
          class="flex items-center gap-0.5 py-1 px-1.5 text-xs font-medium rounded-md text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <svg class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
          Clear
        </button>

        <!-- Count -->
        <span v-if="tasksStore.tasks.total" class="ml-auto text-[10px] text-gray-400 dark:text-gray-500 tabular-nums">
          {{ tasksStore.tasks.total }} tasks
        </span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading && !tasksStore.tasks.data?.length" class="flex items-center justify-center py-12">
      <svg class="w-5 h-5 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12a9 9 0 11-6.219-8.56"/>
      </svg>
    </div>

    <!-- Table -->
    <div v-else-if="tasksStore.tasks.data?.length" class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-100 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/60">
            <th class="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 text-left w-20">Type</th>
            <th class="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 text-left w-20">ID</th>
            <th class="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 text-left w-10"></th>
            <th class="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 text-left">Title</th>
            <th class="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 text-left hidden md:table-cell w-32">Status</th>
            <th class="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 text-left hidden md:table-cell w-28">Board</th>
            <th class="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 text-left hidden lg:table-cell">Tags</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50 dark:divide-gray-700/40">
          <tr
            v-for="obj in tasksStore.tasks.data"
            :key="obj.id"
            class="cursor-pointer hover:bg-blue-50/40 dark:hover:bg-gray-700/30 transition-colors"
            @click="openTask(obj)"
          >
            <!-- Type -->
            <td class="px-3 py-2">
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
            </td>

            <!-- ID -->
            <td class="px-3 py-2">
              <router-link
                :to="{ ...route, query: { ...route.query, task: obj.task_id } }"
                class="text-[11px] font-mono font-medium text-blue-600 dark:text-blue-400 hover:underline"
                @click.stop
              >{{ obj.task_id }}</router-link>
            </td>

            <!-- User -->
            <td class="px-3 py-2" @click.stop>
              <UserIcon v-if="obj.user" :user="obj.user" :status="false" avatar-size="xs" />
              <span v-else class="text-[10px] text-gray-300 dark:text-gray-600">—</span>
            </td>

            <!-- Title -->
            <td class="px-3 py-2">
              <div class="flex items-center gap-2 min-w-0">
                <span class="text-xs font-medium text-gray-900 dark:text-white truncate">{{ obj.name }}</span>
                <span v-if="obj.due_date" class="flex-shrink-0 text-[10px] text-gray-400 tabular-nums">
                  {{ DateTime.fromISO(obj.due_date).toLocaleString(DateTime.DATE_MED) }}
                </span>
              </div>
            </td>

            <!-- Status -->
            <td class="px-3 py-2 hidden md:table-cell">
              <div v-if="obj.status" class="flex items-center gap-1.5">
                <div class="w-2 h-2 rounded-full flex-shrink-0" :style="{ backgroundColor: obj.status.color || '#6B7280' }"></div>
                <span class="text-xs text-gray-600 dark:text-gray-400 truncate">{{ obj.status.title }}</span>
              </div>
              <span v-else class="text-xs text-gray-300 dark:text-gray-600">—</span>
            </td>

            <!-- Board -->
            <td class="px-3 py-2 hidden md:table-cell">
              <span v-if="obj.status?.board" class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ obj.status.board.title }}</span>
              <span v-else class="text-xs text-gray-300 dark:text-gray-600">—</span>
            </td>

            <!-- Tags -->
            <td class="px-3 py-2 hidden lg:table-cell" @click.stop>
              <div class="flex gap-1 flex-wrap">
                <button
                  v-for="(str, i) in obj.tags"
                  :key="i"
                  type="button"
                  @click="form.tag = form.tag === str ? '' : str"
                >
                  <Badge :color="form.tag === str ? 'blue' : 'gray'" size="xs" class="cursor-pointer hover:opacity-75">{{ str }}</Badge>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty -->
    <div v-else class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div class="flex flex-col items-center justify-center py-12 px-4">
        <svg class="w-10 h-10 text-gray-200 dark:text-gray-700 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
          <rect x="9" y="3" width="6" height="4" rx="1"/>
        </svg>
        <p class="text-xs font-medium text-gray-400 dark:text-gray-500">No tasks found</p>
        <p v-if="hasActiveFilters" class="text-[10px] text-gray-300 dark:text-gray-600 mt-0.5">Try adjusting your filters</p>
      </div>
    </div>

    <!-- Pagination -->
    <TailwindPagination v-if="tasksStore.tasks.data?.length" :limit="3" :data="tasksStore.tasks" @pagination-change-page="(page) => (form.page = page)" />
  </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
