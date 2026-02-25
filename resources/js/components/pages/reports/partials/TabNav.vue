<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const tabs = [
    { name: 'reports.time-tracking', label: 'Time Tracking' },
    { name: 'reports.project-overview', label: 'Project Overview' },
    { name: 'reports.team-workload', label: 'Team Workload' },
    { name: 'reports.invoice-summary', label: 'Invoice Summary' },
]

const isActive = (tabName) => route.name === tabName
</script>

<template>
    <nav class="flex gap-1 border-b border-gray-200 dark:border-gray-700 mb-5">
        <router-link
            v-for="tab in tabs"
            :key="tab.name"
            :to="{ name: tab.name }"
            class="px-4 py-2 text-sm font-medium rounded-t-lg transition-colors -mb-px border-b-2"
            :class="
                isActive(tab.name)
                    ? 'border-blue-600 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            "
        >
            {{ tab.label }}
        </router-link>
    </nav>
</template>
