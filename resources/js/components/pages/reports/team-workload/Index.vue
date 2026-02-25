<script setup>
import Auth from '@/components/layouts/Auth.vue'
import Card from '@/components/shared/Card.vue'
import Badge from '@/components/shared/ui/Badge.vue'
import SearchSelect from '@/components/shared/ui/SearchSelect.vue'
import Label from '@/components/shared/Label.vue'
import DatePicker from '@/components/shared/DatePicker.vue'
import TabNav from '../partials/TabNav.vue'
import { useBreadcrumbStore } from '@/store/breadcrumb'
import { ref, reactive, watch, onMounted, computed } from 'vue'

const breadcrumb = useBreadcrumbStore()

const team = ref([])
const totals = ref({})
const projects = ref([])
const loading = ref(false)

const filters = reactive({
    project_id: '',
    date_from: '',
    date_to: '',
})

const load = () => {
    loading.value = true
    const params = {}
    if (filters.project_id) params.project_id = filters.project_id
    if (filters.date_from) params.date_from = filters.date_from
    if (filters.date_to) params.date_to = filters.date_to

    window.axios
        .get('/api/v1/reports/team-workload', { params })
        .then((res) => {
            team.value = res.data.data
            totals.value = res.data.totals
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

watch(() => filters.project_id, () => load())
watch(() => filters.date_from, () => load())
watch(() => filters.date_to, () => load())

const rateColor = (rate) => {
    if (rate >= 75) return 'green'
    if (rate >= 50) return 'yellow'
    return 'red'
}

onMounted(() => {
    load()
    loadProjects()
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
                <div class="min-w-[160px]">
                    <Label forInput="project">Project</Label>
                    <SearchSelect
                        v-model="filters.project_id"
                        :options="projectOptions"
                        placeholder="All Projects"
                        search-placeholder="Search projects..."
                    />
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
                <table class="w-full text-sm text-left" v-if="team.length">
                    <thead class="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 uppercase">
                        <tr>
                            <th class="px-4 py-3">User</th>
                            <th class="px-4 py-3 text-right">Tasks Assigned</th>
                            <th class="px-4 py-3 text-right">Tasks Completed</th>
                            <th class="px-4 py-3 text-right">Completion Rate</th>
                            <th class="px-4 py-3 text-right">Hours Logged</th>
                        </tr>
                    </thead>
                    <tbody class="text-gray-700 dark:text-gray-300">
                        <tr
                            v-for="user in team"
                            :key="user.id"
                            class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                            <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">{{ user.name }}</td>
                            <td class="px-4 py-3 text-right font-mono">{{ user.tasks_assigned }}</td>
                            <td class="px-4 py-3 text-right font-mono">{{ user.tasks_completed }}</td>
                            <td class="px-4 py-3 text-right">
                                <Badge :color="rateColor(user.completion_rate)">{{ user.completion_rate }}%</Badge>
                            </td>
                            <td class="px-4 py-3 text-right font-mono">{{ user.hours_logged }}</td>
                        </tr>
                    </tbody>
                    <tfoot class="bg-gray-50 dark:bg-gray-800 font-medium text-gray-900 dark:text-white">
                        <tr>
                            <td class="px-4 py-3">Totals</td>
                            <td class="px-4 py-3 text-right font-mono">{{ totals.tasks_assigned }}</td>
                            <td class="px-4 py-3 text-right font-mono">{{ totals.tasks_completed }}</td>
                            <td class="px-4 py-3 text-right">
                                <Badge :color="rateColor(totals.completion_rate)">{{ totals.completion_rate }}%</Badge>
                            </td>
                            <td class="px-4 py-3 text-right font-mono">{{ totals.hours_logged }}</td>
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
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p class="text-sm font-medium text-gray-500 dark:text-gray-400">No team data found</p>
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
    </Auth>
</template>
