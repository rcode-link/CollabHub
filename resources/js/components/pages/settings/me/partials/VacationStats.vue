<script setup lang="js">
import { onMounted } from "vue";
import { useVacationGroupStore } from "@/store/vacationGroupStore";

const store = useVacationGroupStore();

onMounted(() => {
    store.loadMyStats();
});
</script>
<template>
    <div v-if="store.myStats.length">
        <h2 class="text-base font-semibold text-gray-900 dark:text-white mb-4">
            Vacation Balance
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div
                v-for="stat in store.myStats"
                :key="stat.group.id"
                class="p-4 rounded-lg bg-gray-50 dark:bg-gray-800"
            >
                <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                    {{ stat.group.name }}
                </p>
                <div class="flex items-baseline gap-3">
                    <div>
                        <span class="text-lg font-semibold" :class="stat.remaining > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                            {{ stat.remaining }}
                        </span>
                        <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">remaining</span>
                    </div>
                    <div class="text-xs text-gray-400 dark:text-gray-500">
                        {{ stat.used }} / {{ stat.allocated }} used
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
