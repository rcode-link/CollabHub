<script setup lang="js">
import { onMounted, watch } from "vue";
import { useVacationGroupStore } from "@/store/vacationGroupStore";
import Card from "@/components/shared/Card.vue";
import { DateTime } from "luxon";

const props = defineProps({
    userId: { type: Number, required: true },
});

const store = useVacationGroupStore();

const loadStats = () => {
    store.loadUserStats(props.userId);
};

onMounted(loadStats);
watch(() => props.userId, loadStats);
</script>
<template>
    <Card v-if="store.userStats">
        <div class="p-5">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Vacation Overview
            </h3>

            <!-- Stats -->
            <div
                v-if="store.userStats.stats?.length"
                class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5"
            >
                <div
                    v-for="stat in store.userStats.stats"
                    :key="stat.group.id"
                    class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                    <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        {{ stat.group.name }}
                    </p>
                    <div class="flex items-baseline gap-2">
                        <span
                            class="text-lg font-semibold"
                            :class="stat.remaining > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
                        >
                            {{ stat.remaining }}
                        </span>
                        <span class="text-xs text-gray-400 dark:text-gray-500">
                            / {{ stat.allocated }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- History -->
            <div v-if="store.userStats.history?.length">
                <h4 class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                    History
                </h4>
                <table class="w-full text-sm text-left">
                    <thead class="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 uppercase">
                        <tr>
                            <th class="px-3 py-2">Title</th>
                            <th class="px-3 py-2">Group</th>
                            <th class="px-3 py-2">Dates</th>
                            <th class="px-3 py-2">Days</th>
                            <th class="px-3 py-2">Status</th>
                            <th class="px-3 py-2"></th>
                        </tr>
                    </thead>
                    <tbody class="text-gray-700 dark:text-gray-300">
                        <tr
                            v-for="item in store.userStats.history"
                            :key="item.id"
                            class="border-b border-gray-100 dark:border-gray-800"
                        >
                            <td class="px-3 py-2">{{ item.summary }}</td>
                            <td class="px-3 py-2">
                                {{ item.vacation_group?.name ?? "—" }}
                            </td>
                            <td class="px-3 py-2 whitespace-nowrap">
                                {{ DateTime.fromISO(item.start_time).toLocaleString(DateTime.DATE_SHORT) }}
                                <template v-if="item.freq_until">
                                    — {{ DateTime.fromISO(item.freq_until).toLocaleString(DateTime.DATE_SHORT) }}
                                </template>
                            </td>
                            <td class="px-3 py-2">{{ item.total_days }}</td>
                            <td class="px-3 py-2">
                                <span class="inline-flex items-center gap-1.5">
                                    <span
                                        class="w-2 h-2 rounded-full"
                                        :class="item.approved ? 'bg-green-500' : 'bg-yellow-500'"
                                    />
                                    {{ item.approved ? "Approved" : "Pending" }}
                                </span>
                            </td>
                            <td class="px-3 py-2">
                                <router-link
                                    v-if="item.chat_id"
                                    :to="`/chat/${item.chat_id}/view`"
                                    class="text-blue-600 dark:text-blue-400 hover:underline text-xs"
                                >
                                    <svg class="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </router-link>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </Card>
</template>
