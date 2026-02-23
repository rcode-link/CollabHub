<template>
    <div class="relative" ref="dropdownEl">
        <button
            type="button"
            @click="() => { loadStatuses(); toggleDropdown(); }"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
            :class="obj.open
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'"
        >
            {{ obj.title }}
            <svg class="w-3 h-3 transition-transform" :class="open && 'rotate-180'" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
        </button>

        <Transition name="dropdown">
            <div
                v-if="open"
                class="absolute top-full left-0 mt-1 w-48 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg py-1 z-50"
            >
                <div v-if="!list.length" class="px-3 py-2 text-xs text-gray-400 dark:text-gray-500">Loading…</div>
                <button
                    v-for="status in list"
                    :key="status.id"
                    type="button"
                    @click="() => updateTask(status.id)"
                    class="w-full text-left px-3 py-2 text-sm transition-colors"
                    :class="status.id === obj.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'"
                >
                    {{ status.title }}
                </button>
            </div>
        </Transition>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute } from "vue-router";
import { useDropdown } from "@/composables/useDropdown";

const route = useRoute();
const props = defineProps({ obj: {}, taskId: null });

const list = ref([]);
const { open, el: dropdownEl, toggle: toggleDropdown } = useDropdown();

const loadStatuses = () => {
    if (list.value.length) return;
    axios.get("/api/v1/tasks-statuses/", {
        params: {
            project_id: route.params.project,
            board_id: props.obj.board?.id,
        },
    }).then((res) => { list.value = res.data.data; });
};

const updateTask = (id) => {
    open.value = false;
    let url = "/api/v1/tasks/change-status";
    if (route.name !== "project.board.view") url += "?fullList=true";
    axios.put(url, {
        status_id: id,
        sprint_id: props.obj.sprint?.id,
        task_id: props.taskId,
    });
};
</script>

<style scoped>
.dropdown-enter-active, .dropdown-leave-active { transition: opacity 0.1s ease, transform 0.1s ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
