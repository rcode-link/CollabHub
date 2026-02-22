<script setup>
import { useRoute } from "vue-router";
import { onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useBreadcrumbStore } from "@/store/breadcrumb";
import { useBoardsState } from "@/store/boards";
import Button from "@/components/shared/Button.vue";

const boardsState = useBoardsState();
const breadcrumbStore = useBreadcrumbStore();
const route = useRoute();

const statuses = ref([]);
const addTitle = ref("");
const savingId = ref(null);
const adding = ref(false);

const loadStatuses = () => {
    window.axios.get(`/api/v1/tasks-statuses/`, {
        params: {
            project_id: route.params.project,
            board_id: route.params.board,
        },
    }).then((res) => {
        statuses.value = res.data.data;
    });
};

const update = (value) => {
    savingId.value = value.id;
    window.axios.put(`/api/v1/tasks-statuses/${value.id}`, value)
        .then(() => loadStatuses())
        .finally(() => { savingId.value = null; });
};

const moveUp = (status, index) => {
    if (index === 0) return;
    update({ order: status.order - 1, id: status.id });
};

const moveDown = (status, index) => {
    if (index === statuses.value.length - 1) return;
    update({ order: status.order + 1, id: status.id });
};

const create = () => {
    if (!addTitle.value.trim()) return;
    adding.value = true;
    window.axios.post(`/api/v1/tasks-statuses`, {
        title: addTitle.value,
        project_id: route.params.project,
        board_id: route.params.board,
    }).then(() => {
        loadStatuses();
        addTitle.value = "";
    }).finally(() => { adding.value = false; });
};

loadStatuses();

onMounted(() => {
    const breadcrumItems = [
        {
            link: {
                name: "project.board.view",
                params: {
                    board: boardsState.activeBoard?.id,
                    sprint: boardsState.activeSprint?.id,
                },
            },
            title: boardsState.activeBoard?.title,
        },
    ];

    if (boardsState.activeSprint?.title) {
        breadcrumItems.push({
            link: {
                name: "project.board.view",
                params: {
                    board: boardsState.activeBoard?.id,
                    sprint: boardsState.activeSprint.id,
                },
            },
            title: boardsState.activeSprint.title,
        });
    }

    breadcrumItems.push({ title: "Settings" });
    breadcrumbStore.addEntry(breadcrumItems);
});

onBeforeUnmount(() => {
    breadcrumbStore.addEntry([]);
});
</script>

<template>
    <div class="max-w-2xl space-y-4">

        <!-- Statuses card -->
        <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
            <!-- Header -->
            <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <div>
                    <h2 class="text-sm font-semibold text-gray-900 dark:text-white">Statuses</h2>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Manage and reorder board columns</p>
                </div>
                <span class="text-xs text-gray-400 dark:text-gray-500 tabular-nums">{{ statuses.length }} statuses</span>
            </div>

            <!-- Status list -->
            <ul class="divide-y divide-gray-100 dark:divide-gray-700/60">
                <li
                    v-for="(obj, index) in statuses"
                    :key="obj.id"
                    class="flex items-center gap-3 px-5 py-3 group"
                >
                    <!-- Reorder arrows -->
                    <div class="flex flex-col gap-0.5 flex-shrink-0">
                        <button
                            @click="moveUp(obj, index)"
                            :disabled="index === 0"
                            class="p-0.5 rounded text-gray-300 dark:text-gray-600 transition-colors"
                            :class="index !== 0 && 'hover:text-gray-600 dark:hover:text-gray-300'"
                        >
                            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 15l-6-6-6 6"/>
                            </svg>
                        </button>
                        <button
                            @click="moveDown(obj, index)"
                            :disabled="index === statuses.length - 1"
                            class="p-0.5 rounded text-gray-300 dark:text-gray-600 transition-colors"
                            :class="index !== statuses.length - 1 && 'hover:text-gray-600 dark:hover:text-gray-300'"
                        >
                            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M6 9l6 6 6-6"/>
                            </svg>
                        </button>
                    </div>

                    <!-- Status name -->
                    <input
                        v-model="obj.title"
                        class="flex-1 text-sm text-gray-900 dark:text-white bg-transparent border border-transparent rounded-lg px-2 py-1 hover:border-gray-200 dark:hover:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                        @keyup.enter="() => update({ title: obj.title, id: obj.id })"
                        @blur="() => update({ title: obj.title, id: obj.id })"
                    />

                    <!-- Open/closed toggle -->
                    <label class="flex items-center gap-2 cursor-pointer flex-shrink-0">
                        <div class="relative">
                            <input
                                type="checkbox"
                                class="sr-only"
                                :checked="obj.open"
                                @change="() => update({ open: !obj.open, id: obj.id })"
                            />
                            <div
                                class="w-8 h-4 rounded-full transition-colors"
                                :class="obj.open ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'"
                            ></div>
                            <div
                                class="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform"
                                :class="obj.open ? 'translate-x-4' : 'translate-x-0'"
                            ></div>
                        </div>
                        <span class="text-xs text-gray-500 dark:text-gray-400">Open</span>
                    </label>

                    <!-- Saving spinner -->
                    <div v-if="savingId === obj.id" class="flex-shrink-0">
                        <svg class="w-3.5 h-3.5 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 12a9 9 0 11-6.219-8.56"/>
                        </svg>
                    </div>
                </li>
            </ul>

            <!-- Add new status -->
            <div class="flex items-center gap-2 px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                <input
                    v-model="addTitle"
                    type="text"
                    placeholder="New status name…"
                    class="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    @keyup.enter="create"
                />
                <Button size="sm" :disabled="!addTitle.trim() || adding" @click="create">
                    <svg v-if="adding" class="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 12a9 9 0 11-6.219-8.56"/>
                    </svg>
                    Add
                </Button>
            </div>
        </div>

    </div>
</template>
