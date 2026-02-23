<script setup>
import { useRoute, useRouter } from "vue-router";
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { useBreadcrumbStore } from "@/store/breadcrumb";
import { useBoardsState } from "@/store/boards";
import Button from "@/components/shared/Button.vue";
import UsersSelectInput from "@/components/shared/SelectUsersInProject.vue";
import { TailwindPagination } from "laravel-vue-pagination";
import { DateTime } from "luxon";
import UiToggle from "@/components/shared/ui/Toggle.vue";
import UiSelect from "@/components/shared/ui/Select.vue";
import UiBadge from "@/components/shared/ui/Badge.vue";

const route = useRoute();
const router = useRouter();
const breadcrumbStore = useBreadcrumbStore();
const boardsState = useBoardsState();

const tasks = ref({ data: [], meta: {} });
const taskTypesList = ref([]);
const statuses = ref([]);
const added = ref([]);
const timer = ref(null);
const loading = ref(false);
const confirmRemoveId = ref(null);

const form = reactive({
    type_id: null,
    search: "",
    status_id: null,
    user_id: null,
    page: 1,
    in_sprint: 0,
});

const loadTasks = () => {
    loading.value = true;
    axios.get("/api/v1/sprint/tasks", {
        params: {
            sprint_id: route.params.sprint,
            project_id: route.params.project,
            ...form,
        },
    }).then((res) => {
        tasks.value = res.data;
    }).finally(() => {
        loading.value = false;
    });
};

const load = () => {
    loadTasks();
    axios.get(`/api/v1/tasks-statuses/`, {
        params: { project_id: route.params.project },
    }).then((res) => { statuses.value = res.data.data; });

    axios.get("/api/v1/task-types").then((res) => {
        taskTypesList.value = res.data;
    });
};

const changePage = (page) => { form.page = page; };

watch(() => form, () => {
    added.value = [];
    router.push({ query: { ...form } });
    clearTimeout(timer.value);
    timer.value = setTimeout(() => loadTasks(), 300);
}, { deep: true });

const addTaskToSprint = ({ id }) => {
    axios.put("/api/v1/sprint/tasks", {
        sprint_id: route.params.sprint,
        task_id: id,
    }).then(() => { added.value.push(id); });
};

const handleRemoveFromSprint = ({ id }) => {
    axios.delete("/api/v1/sprint/tasks", {
        data: { sprint_id: route.params.sprint, task_id: id },
    }).then(() => {
        confirmRemoveId.value = null;
        loadTasks();
    });
};

onMounted(() => {
    form.search = route.query.search ?? "";
    form.page = route.query.page ?? 1;
    form.user_id = route.query.user_id ?? null;
    form.type_id = route.query.type_id ?? null;
    form.status_id = route.query.status_id ?? null;
    form.in_sprint = route.query.in_sprint ?? 0;
    load();

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
                    sprint: boardsState.activeSprint?.id,
                },
            },
            title: boardsState.activeSprint.title,
        });
    }

    breadcrumItems.push({ title: "Manage tasks" });
    breadcrumbStore.addEntry(breadcrumItems);
});

onBeforeUnmount(() => { breadcrumbStore.addEntry([]); });
</script>

<template>
    <div class="space-y-3">

        <!-- Filters -->
        <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-700">
                <h2 class="text-sm font-semibold text-gray-900 dark:text-white">Manage tasks</h2>
                <!-- Sprint toggle -->
                <UiToggle
                    :model-value="form.in_sprint == 1"
                    @update:model-value="val => form.in_sprint = val ? 1 : 0"
                >In sprint only</UiToggle>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4">
                <!-- Search -->
                <div class="relative">
                    <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                    <input
                        v-model="form.search"
                        type="text"
                        placeholder="Search tasks…"
                        class="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                <!-- Type filter -->
                <UiSelect v-model="form.type_id">
                    <option :value="null">All types</option>
                    <option v-for="t in taskTypesList" :key="t.id" :value="t.id">{{ t.title }}</option>
                </UiSelect>

                <!-- Status filter -->
                <UiSelect v-model="form.status_id">
                    <option :value="null">All statuses</option>
                    <option v-for="s in statuses" :key="s.id" :value="s.id">{{ s.title }}</option>
                </UiSelect>

                <!-- User filter -->
                <UsersSelectInput
                    :key="form.user_id"
                    v-model="form.user_id"
                    :show-clean-input="true"
                />
            </div>
        </div>

        <!-- Task table -->
        <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
            <!-- Column headers -->
            <div class="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/40 px-4 py-2">
                <div class="w-20 flex-shrink-0 text-xs font-medium uppercase tracking-wide text-gray-400">ID</div>
                <div class="flex-1 text-xs font-medium uppercase tracking-wide text-gray-400">Task</div>
                <div class="w-28 flex-shrink-0 text-xs font-medium uppercase tracking-wide text-gray-400 hidden sm:block">Status</div>
                <div class="w-24 flex-shrink-0 text-xs font-medium uppercase tracking-wide text-gray-400 hidden md:block">Type</div>
                <div class="w-32 flex-shrink-0"></div>
            </div>

            <!-- Loading -->
            <div v-if="loading" class="flex justify-center py-10">
                <svg class="w-5 h-5 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
            </div>

            <!-- Empty state -->
            <div v-else-if="!tasks.data?.length" class="flex flex-col items-center py-12 text-center">
                <svg class="w-8 h-8 text-gray-300 dark:text-gray-600 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                <p class="text-sm text-gray-500 dark:text-gray-400">No tasks found</p>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Try adjusting your filters</p>
            </div>

            <!-- Rows -->
            <template v-else>
                <div
                    v-for="obj in tasks.data"
                    :key="obj.id"
                    class="flex items-center gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                    <!-- Task ID -->
                    <div class="w-20 flex-shrink-0">
                        <span class="text-xs font-mono text-gray-400 dark:text-gray-500">{{ obj.task_id }}</span>
                    </div>

                    <!-- Task name -->
                    <div class="flex-1 min-w-0">
                        <p class="text-sm text-gray-900 dark:text-white truncate">{{ obj.name }}</p>
                    </div>

                    <!-- Status badge -->
                    <div class="w-28 flex-shrink-0 hidden sm:block">
                        <UiBadge :color="obj.status?.open ? 'blue' : 'green'" size="xs">
                            {{ obj.status?.title }}
                        </UiBadge>
                    </div>

                    <!-- Type -->
                    <div class="w-24 flex-shrink-0 hidden md:block">
                        <span class="text-xs text-gray-500 dark:text-gray-400">{{ obj.type?.title }}</span>
                    </div>

                    <!-- Action -->
                    <div class="w-32 flex-shrink-0 flex justify-end">
                        <!-- Add to sprint -->
                        <Button
                            v-if="!form.in_sprint || form.in_sprint == 0"
                            size="sm"
                            :disabled="added.includes(obj.id)"
                            :variant="added.includes(obj.id) ? 'soft' : 'primary'"
                            @click="addTaskToSprint(obj)"
                        >
                            <svg v-if="added.includes(obj.id)" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20 6L9 17l-5-5"/>
                            </svg>
                            {{ added.includes(obj.id) ? 'Added' : 'Add to sprint' }}
                        </Button>

                        <!-- Remove from sprint -->
                        <template v-else>
                            <div v-if="confirmRemoveId === obj.id" class="flex items-center gap-1.5">
                                <span class="text-xs text-gray-500 dark:text-gray-400">Remove?</span>
                                <Button size="sm" variant="danger" @click="handleRemoveFromSprint(obj)">Yes</Button>
                                <Button size="sm" variant="ghost" @click="confirmRemoveId = null">No</Button>
                            </div>
                            <Button v-else size="sm" variant="soft" @click="confirmRemoveId = obj.id">
                                Remove
                            </Button>
                        </template>
                    </div>
                </div>
            </template>

            <!-- Pagination -->
            <div v-if="tasks.meta?.last_page > 1" class="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
                <TailwindPagination
                    :data="tasks"
                    :limit="3"
                    @pagination-change-page="changePage"
                />
            </div>
        </div>
    </div>
</template>
