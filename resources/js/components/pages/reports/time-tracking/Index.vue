<script setup>
import Auth from '@/components/layouts/Auth.vue'
import Card from '@/components/shared/Card.vue'
import UiSelect from '@/components/shared/ui/Select.vue'
import SearchSelect from '@/components/shared/ui/SearchSelect.vue'
import Text from '@/components/shared/Text.vue'
import Label from '@/components/shared/Label.vue'
import DatePicker from '@/components/shared/DatePicker.vue'
import TabNav from '../partials/TabNav.vue'
import { TailwindPagination } from 'laravel-vue-pagination'
import { useBreadcrumbStore } from '@/store/breadcrumb'
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { debounce } from '@/functions/debounce'

const breadcrumb = useBreadcrumbStore()

const entries = ref({ data: [] })
const projects = ref([])
const users = ref([])
const loading = ref(false)

const filters = reactive({
    search: '',
    project_id: '',
    user_id: '',
    date_from: '',
    date_to: '',
})

const load = (page = 1) => {
    loading.value = true
    const params = { page }
    if (filters.search) params.search = filters.search
    if (filters.project_id) params.project_id = filters.project_id
    if (filters.user_id) params.user_id = filters.user_id
    if (filters.date_from) params.date_from = filters.date_from
    if (filters.date_to) params.date_to = filters.date_to

    window.axios
        .get('/api/v1/reports/time-tracking', { params })
        .then((res) => {
            entries.value = res.data
        })
        .finally(() => {
            loading.value = false
        })
}

const loadProjects = () => {
    window.axios.get('/api/v1/projects').then((res) => {
        projects.value = res.data.data ?? res.data
    })
}

const projectOptions = computed(() =>
    (projects.value ?? []).map(p => ({ value: p.id, label: p.name }))
)

const loadUsers = () => {
    window.axios.get('/api/v1/users').then((res) => {
        users.value = res.data.data ?? res.data
    })
}

const debouncedLoad = debounce(() => load(), 300)

watch(() => filters.search, debouncedLoad)
watch(() => filters.project_id, () => load())
watch(() => filters.user_id, () => load())
watch(() => filters.date_from, () => load())
watch(() => filters.date_to, () => load())

const formatDuration = (minutes) => {
    if (!minutes) return '0:00'
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${h}:${String(m).padStart(2, '0')}`
}

const totalHours = () => {
    if (!entries.value.data?.length) return '0:00'
    const total = entries.value.data.reduce((sum, e) => sum + (e.duration_minutes || 0), 0)
    return formatDuration(total)
}

onMounted(() => {
    load()
    loadProjects()
    loadUsers()
    breadcrumb.setLinks([
        { link: '/', title: 'Home' },
        { title: 'Reports' },
    ])
})
</script>

<template>
    <Auth>
        <div class="flex items-center justify-between mb-2">
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">Reports</h1>
        </div>

        <TabNav />

        <!-- Filters -->
        <Card class="mb-4">
            <div class="flex flex-wrap items-end gap-3 p-4">
                <div class="flex-1 min-w-[180px]">
                    <Label forInput="search">Search</Label>
                    <Text
                        v-model="filters.search"
                        name="search"
                        placeholder="Search by task name..."
                    />
                </div>

                <div class="min-w-[160px]">
                    <Label forInput="project">Project</Label>
                    <SearchSelect
                        v-model="filters.project_id"
                        :options="projectOptions"
                        placeholder="All Projects"
                        search-placeholder="Search projects..."
                    />
                </div>

                <div class="min-w-[160px]">
                    <Label forInput="user">User</Label>
                    <UiSelect v-model="filters.user_id">
                        <option value="">All Users</option>
                        <option
                            v-for="user in users"
                            :key="user.id"
                            :value="user.id"
                        >
                            {{ user.name }}
                        </option>
                    </UiSelect>
                </div>

                <div class="min-w-[150px]">
                    <Label forInput="date_from">From</Label>
                    <DatePicker v-model="filters.date_from" name="date_from" />
                </div>

                <div class="min-w-[150px]">
                    <Label forInput="date_to">To</Label>
                    <DatePicker v-model="filters.date_to" name="date_to" />
                </div>
            </div>
        </Card>

        <!-- Table -->
        <Card>
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left" v-if="entries.data.length">
                    <thead class="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 uppercase">
                        <tr>
                            <th class="px-4 py-3">Date</th>
                            <th class="px-4 py-3">User</th>
                            <th class="px-4 py-3">Project</th>
                            <th class="px-4 py-3">Task</th>
                            <th class="px-4 py-3">Start</th>
                            <th class="px-4 py-3">End</th>
                            <th class="px-4 py-3 text-right">Duration</th>
                        </tr>
                    </thead>
                    <tbody class="text-gray-700 dark:text-gray-300">
                        <tr
                            v-for="entry in entries.data"
                            :key="entry.id"
                            class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                            <td class="px-4 py-3">{{ entry.date }}</td>
                            <td class="px-4 py-3">{{ entry.user?.name }}</td>
                            <td class="px-4 py-3">{{ entry.project?.name }}</td>
                            <td class="px-4 py-3">{{ entry.task?.name }}</td>
                            <td class="px-4 py-3 font-mono">{{ entry.start }}</td>
                            <td class="px-4 py-3 font-mono">{{ entry.end }}</td>
                            <td class="px-4 py-3 text-right font-mono">{{ formatDuration(entry.duration_minutes) }}</td>
                        </tr>
                    </tbody>
                    <tfoot class="bg-gray-50 dark:bg-gray-800 font-medium text-gray-900 dark:text-white">
                        <tr>
                            <td class="px-4 py-3" colspan="6">Total (this page)</td>
                            <td class="px-4 py-3 text-right font-mono">{{ totalHours() }}</td>
                        </tr>
                    </tfoot>
                </table>

                <!-- Empty state -->
                <div
                    v-else-if="!loading"
                    class="flex flex-col items-center justify-center py-24 text-center"
                >
                    <svg class="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="text-sm font-medium text-gray-500 dark:text-gray-400">No time entries found</p>
                    <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Try adjusting your filters</p>
                </div>

                <!-- Loading -->
                <div v-if="loading" class="flex items-center justify-center py-12">
                    <svg class="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                </div>
            </div>
        </Card>

        <!-- Pagination -->
        <div class="mt-4" v-if="entries.data.length">
            <TailwindPagination
                :limit="3"
                :data="entries"
                @pagination-change-page="load"
            />
        </div>
    </Auth>
</template>
