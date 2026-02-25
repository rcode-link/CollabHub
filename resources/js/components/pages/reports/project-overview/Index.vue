<script setup>
import Auth from '@/components/layouts/Auth.vue'
import Card from '@/components/shared/Card.vue'
import Badge from '@/components/shared/ui/Badge.vue'
import Text from '@/components/shared/Text.vue'
import Label from '@/components/shared/Label.vue'
import TabNav from '../partials/TabNav.vue'
import { useBreadcrumbStore } from '@/store/breadcrumb'
import { ref, reactive, watch, onMounted } from 'vue'
import { debounce } from '@/functions/debounce'

const breadcrumb = useBreadcrumbStore()

const projects = ref([])
const totals = ref({})
const loading = ref(false)

const filters = reactive({
    search: '',
})

const load = () => {
    loading.value = true
    const params = {}
    if (filters.search) params.search = filters.search

    window.axios
        .get('/api/v1/reports/project-overview', { params })
        .then((res) => {
            projects.value = res.data.data
            totals.value = res.data.totals
        })
        .finally(() => {
            loading.value = false
        })
}

const debouncedLoad = debounce(() => load(), 300)

watch(() => filters.search, debouncedLoad)

onMounted(() => {
    load()
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
                        placeholder="Search by project name..."
                    />
                </div>
            </div>
        </Card>

        <!-- Table -->
        <Card>
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left" v-if="projects.length">
                    <thead class="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 uppercase">
                        <tr>
                            <th class="px-4 py-3">Project</th>
                            <th class="px-4 py-3">Key</th>
                            <th class="px-4 py-3 text-right">Total Tasks</th>
                            <th class="px-4 py-3 text-right">Open</th>
                            <th class="px-4 py-3 text-right">Closed</th>
                            <th class="px-4 py-3 text-right">Team Members</th>
                            <th class="px-4 py-3 text-right">Total Hours</th>
                        </tr>
                    </thead>
                    <tbody class="text-gray-700 dark:text-gray-300">
                        <tr
                            v-for="project in projects"
                            :key="project.id"
                            class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                            <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">{{ project.name }}</td>
                            <td class="px-4 py-3">
                                <Badge color="blue">{{ project.key }}</Badge>
                            </td>
                            <td class="px-4 py-3 text-right font-mono">{{ project.total_tasks }}</td>
                            <td class="px-4 py-3 text-right font-mono">{{ project.open_tasks }}</td>
                            <td class="px-4 py-3 text-right font-mono">{{ project.closed_tasks }}</td>
                            <td class="px-4 py-3 text-right font-mono">{{ project.team_members }}</td>
                            <td class="px-4 py-3 text-right font-mono">{{ project.total_hours }}</td>
                        </tr>
                    </tbody>
                    <tfoot class="bg-gray-50 dark:bg-gray-800 font-medium text-gray-900 dark:text-white">
                        <tr>
                            <td class="px-4 py-3" colspan="2">Totals</td>
                            <td class="px-4 py-3 text-right font-mono">{{ totals.total_tasks }}</td>
                            <td class="px-4 py-3 text-right font-mono">{{ totals.open_tasks }}</td>
                            <td class="px-4 py-3 text-right font-mono">{{ totals.closed_tasks }}</td>
                            <td class="px-4 py-3 text-right font-mono">{{ totals.team_members }}</td>
                            <td class="px-4 py-3 text-right font-mono">{{ totals.total_hours }}</td>
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
                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <p class="text-sm font-medium text-gray-500 dark:text-gray-400">No projects found</p>
                    <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Try adjusting your search</p>
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
