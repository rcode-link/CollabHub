<template>
    <div class="flex-shrink-0 w-[272px] flex flex-col" style="height: calc(100vh - 160px)">
        <!-- Column header -->
        <div class="flex items-center justify-between px-1 py-2 mb-1.5 flex-shrink-0">
            <div class="flex items-center gap-2">
                <div
                    class="w-2 h-2 rounded-full flex-shrink-0"
                    :style="status.color ? { backgroundColor: status.color } : {}"
                    :class="!status.color && 'bg-gray-300 dark:bg-gray-600'"
                ></div>
                <h3 class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {{ status.title }}
                </h3>
            </div>
            <span v-if="taskCount > 0" class="text-xs text-gray-400 dark:text-gray-500 tabular-nums font-medium">
                {{ taskCount }}
            </span>
        </div>

        <!-- Task list -->
        <div
            class="flex-1 overflow-y-auto space-y-2 pb-4 rounded-xl transition-colors min-h-[60px]"
            :class="isDragOver
                ? 'bg-blue-50 dark:bg-blue-900/10 ring-2 ring-blue-200 dark:ring-blue-800 ring-inset'
                : 'bg-gray-50/60 dark:bg-gray-800/30'"
            @dragover.prevent="onDragOver"
            @dragenter.prevent="onDragEnter"
            @dragleave="onDragLeave"
            @drop="onDrop"
            style="padding: 6px"
        >
            <!-- Loading skeleton -->
            <template v-if="loading">
                <div v-for="n in 3" :key="n" class="h-20 rounded-xl bg-gray-200 dark:bg-gray-700/50 animate-pulse" />
            </template>

            <template v-else>
                <!-- Grouped view: assignee or parent -->
                <template v-if="groupedTasks">
                    <div
                        v-for="group in groupedTasks"
                        :key="group.key"
                        class="mb-2"
                    >
                        <!-- Group header -->
                        <div class="flex items-center gap-1.5 px-1 py-1 mb-1 sticky top-0 bg-gray-50/80 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg z-10">
                            <UserIcon
                                v-if="groupBy === 'assignee' && group.user"
                                :user="group.user"
                                avatar-size="xs"
                                class="flex-shrink-0"
                            />
                            <div v-else class="w-3.5 h-3.5 flex-shrink-0 flex items-center justify-center">
                                <svg class="w-3 h-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path v-if="groupBy === 'parent'" d="M3 6h18M3 12h12M3 18h8"/>
                                    <path v-else d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8"/>
                                </svg>
                            </div>
                            <span class="text-xs font-medium text-gray-600 dark:text-gray-400 truncate flex-1">{{ group.label }}</span>
                            <span class="text-xs text-gray-400 dark:text-gray-500 tabular-nums flex-shrink-0">{{ group.tasks.length }}</span>
                        </div>
                        <!-- Group tasks -->
                        <div class="space-y-2 pl-1">
                            <SingleTask v-for="obj in group.tasks" :key="obj.id" :obj="obj" />
                        </div>
                    </div>
                </template>

                <!-- Flat view (no grouping) -->
                <template v-else>
                    <SingleTask
                        v-for="obj in boardsStore.boardTasks[status.title]"
                        :key="obj.id ?? obj"
                        :obj="obj"
                    />
                </template>

                <!-- Drop placeholder -->
                <div
                    v-if="isDragOver && boardsStore.draggedTask && boardsStore.draggedTask.status?.id !== status.id"
                    class="flex items-center justify-center h-14 rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-700 text-xs text-blue-400 dark:text-blue-500 font-medium"
                >
                    Move to {{ status.title }}
                </div>

                <!-- Empty state -->
                <div
                    v-if="!boardsStore.draggedTask && taskCount === 0"
                    class="flex items-center justify-center h-16 text-xs text-gray-400 dark:text-gray-500"
                >
                    No tasks
                </div>

                <!-- Load more -->
                <button
                    v-if="!boardsStore.draggedTask && hasMore"
                    @click="loadMore"
                    class="w-full py-2 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
                >
                    Load more
                </button>
            </template>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useBoardsState } from "@/store/boards";
import SingleTask from "@/components/pages/project/board/view/SingleTask.vue";
import UserIcon from "@/components/shared/UserIcon.vue";

const boardsStore = useBoardsState();
const route = useRoute();
const page = ref(1);
const hasMore = ref(false);
const isDragOver = ref(false);
const dragEnterCount = ref(0);
const loading = ref(false);

const props = defineProps({
    status: { type: Object },
    filters: { type: Object, default: () => ({ search: "", type_id: null, user_id: null }) },
    groupBy: { type: String, default: 'none' }, // 'none' | 'assignee' | 'parent'
});

const taskCount = computed(() =>
    boardsStore.boardTasks[props.status.title]?.length ?? 0
);

const groupedTasks = computed(() => {
    const tasks = boardsStore.boardTasks[props.status.title] ?? [];

    if (props.groupBy === 'assignee') {
        const map = new Map();
        for (const task of tasks) {
            const key = task.user?.id ?? '__unassigned__';
            if (!map.has(key)) {
                map.set(key, { key, label: task.user?.name ?? 'Unassigned', user: task.user ?? null, tasks: [] });
            }
            map.get(key).tasks.push(task);
        }
        const groups = [...map.values()];
        groups.sort((a, b) => {
            if (a.key === '__unassigned__') return 1;
            if (b.key === '__unassigned__') return -1;
            return a.label.localeCompare(b.label);
        });
        return groups;
    }

    if (props.groupBy === 'parent') {
        const map = new Map();
        for (const task of tasks) {
            const parent = task.parent_task ?? null;
            const key = parent?.id ?? '__none__';
            if (!map.has(key)) {
                map.set(key, { key, label: parent ? `${parent.task_id}: ${parent.name}` : 'No parent', parent, tasks: [] });
            }
            map.get(key).tasks.push(task);
        }
        const groups = [...map.values()];
        groups.sort((a, b) => {
            if (a.key === '__none__') return 1;
            if (b.key === '__none__') return -1;
            return a.label.localeCompare(b.label);
        });
        return groups;
    }

    return null; // null = flat list (no grouping)
});

const loadTaskForStatus = (loadPage = 1) => {
    if (!route.params.sprint) return;

    if (loadPage === 1) {
        loading.value = true;
        boardsStore.setTasks(props.status.title, [], 1);
    }

    const params = {
        page: loadPage,
        status_id: props.status.id,
        sprint_id: route.params.sprint,
        project_id: route.params.project,
    };

    if (props.filters?.search) params.search = props.filters.search;
    if (props.filters?.type_id) params.type_id = props.filters.type_id;
    if (props.filters?.user_id) params.user_id = props.filters.user_id;
    if (props.filters?.tag) params.tag = props.filters.tag;
    if (props.groupBy === 'parent') params.group_by = 'parent';

    window.axios
        .get("/api/v1/tasks", { params })
        .then((res) => {
            boardsStore.setTasks(props.status.title, res.data.data, loadPage);
            hasMore.value = res.data.data.length === 10;
            if (hasMore.value) page.value = loadPage + 1;
        })
        .finally(() => { loading.value = false; });
};

const loadMore = () => loadTaskForStatus(page.value);

const onDragEnter = () => {
    dragEnterCount.value++;
    isDragOver.value = true;
    boardsStore.changeTaskStatus(props.status);
};
const onDragOver = () => {
    boardsStore.changeTaskStatus(props.status);
};
const onDragLeave = () => {
    dragEnterCount.value--;
    if (dragEnterCount.value <= 0) {
        dragEnterCount.value = 0;
        isDragOver.value = false;
    }
};
const onDrop = () => {
    dragEnterCount.value = 0;
    isDragOver.value = false;
};

// Reload when filters or groupBy change
watch(
    () => [props.filters, props.groupBy],
    () => {
        page.value = 1;
        hasMore.value = false;
        loadTaskForStatus(1);
    },
    { deep: true }
);

onMounted(() => {
    loadTaskForStatus(1);
});
</script>
