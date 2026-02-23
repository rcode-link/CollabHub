<script setup lang="js">
import { useBoardsState } from "@/store/boards";
import { computed, onBeforeUnmount, onMounted, provide, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import StatusRow from "@/components/pages/project/board/view/StatusRow.vue";
import { debounce, findIndex } from "lodash";
import { useBreadcrumbStore } from "@/store/breadcrumb";
import { useDropdown } from "@/composables/useDropdown";
import UserIcon from "@/components/shared/UserIcon.vue";
import UiSelect from "@/components/shared/ui/Select.vue";

const route = useRoute();
const boardState = useBoardsState();
const breadcrumbStore = useBreadcrumbStore();

// ---- Filters ----
const filters = reactive({ search: "", type_id: null, user_id: null, tag: "" });

// Provide tag setter so SingleTask can click-to-filter without prop drilling
provide("setTagFilter", (tag) => { filters.tag = filters.tag === tag ? "" : tag; });
const taskTypes = ref([]);
const filterUsers = ref([]);
const userSearch = ref("");
const { open: userDropdownOpen, el: userDropdownEl, toggle: toggleUserDropdown } = useDropdown();

window.axios.get("/api/v1/task-types").then((r) => { taskTypes.value = r.data; });

const loadFilterUsers = debounce(() => {
    window.axios
        .get("/api/v1/users/project", {
            params: { user: userSearch.value, project_id: route.params.project },
        })
        .then((r) => { filterUsers.value = r.data.data ?? r.data; });
}, 300);

watch(userSearch, loadFilterUsers, { immediate: true });

const selectedFilterUser = computed(() =>
    filterUsers.value.find((u) => u.id === filters.user_id)
);
const hasActiveFilters = computed(() =>
    Boolean(filters.search) || filters.type_id !== null || filters.user_id !== null || Boolean(filters.tag)
);

const selectFilterUser = (user) => {
    filters.user_id = user.id;
    userDropdownOpen.value = false;
    userSearch.value = "";
};


const clearFilters = () => {
    filters.search = "";
    filters.type_id = null;
    filters.user_id = null;
    filters.tag = "";
};

// ---- Grouping ----
const groupByOptions = [
    { value: 'none',     label: 'None',     icon: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01' },
    { value: 'assignee', label: 'Assignee', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8 4a3 3 0 0 1 0 6' },
    { value: 'parent',   label: 'Parent',   icon: 'M3 6h18M3 12h12M3 18h8' },
];

const storageKey = computed(() => `board_groupby_${route.params.project}_${route.params.board}`);
const groupBy = ref(localStorage.getItem(storageKey.value) ?? 'none');

watch(groupBy, (val) => { localStorage.setItem(storageKey.value, val); });

const groupByLabel = computed(() => groupByOptions.find(o => o.value === groupBy.value)?.label ?? 'None');

const { open: groupDropdownOpen, el: groupDropdownEl, toggle: toggleGroupDropdown, close: closeGroupDropdown } = useDropdown();

const selectGroupBy = (val) => {
    groupBy.value = val;
    closeGroupDropdown();
};

// ---- Board logic ----
const loadStatuses = () => {
    window.axios
        .get(`/api/v1/tasks-statuses/`, {
            params: {
                project_id: route.params.project,
                board_id: boardState.activeBoard?.id,
            },
        })
        .then((res) => {
            boardState.setStatuses(res.data.data);
        });
};

onMounted(() => {
    window.Echo.private(`task-updated.${route.params.project}`).listen(
        "TaskUpdatedEvent",
        ({ task, oldStatus }) => {
            boardState.updateTask(oldStatus, task);
        }
    );
});

function manageBreadcrumb() {
    if (
        findIndex(breadcrumbStore.links, { title: boardState.activeBoard?.title }) === -1
    ) {
        breadcrumbStore.addEntry([{ link: "", title: boardState.activeBoard?.title }]);
    }
    if (
        findIndex(breadcrumbStore.links, { title: boardState.activeSprint?.title }) === -1 &&
        boardState.activeBoard?.type === "scrum"
    ) {
        breadcrumbStore.addEntry([
            {
                link: {
                    name: "project.board.view",
                    params: { board: boardState.activeBoard.id, sprint: boardState.activeSprint?.id },
                },
                title: boardState.activeBoard.title,
            },
            {
                link: {
                    name: "project.board.view",
                    params: { board: boardState.activeBoard.id, sprint: boardState.activeSprint?.id },
                },
                title: boardState.activeSprint?.title,
            },
        ]);
    }
}

watch(
    () => boardState.activeBoard?.id,
    (newVal) => {
        boardState.setStatuses([]);
        if (!newVal) return;
        loadStatuses();
        manageBreadcrumb();
    },
    { immediate: true }
);

onBeforeUnmount(() => {
    breadcrumbStore.addEntry([]);
});
</script>

<template>
    <div class="flex flex-col gap-3">

        <!-- Filter bar -->
        <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm px-4 py-2.5">
            <div class="flex items-center gap-2 flex-wrap">

                <!-- Search -->
                <div class="relative flex-1 min-w-[160px] max-w-[240px]">
                    <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                    <input
                        v-model="filters.search"
                        type="text"
                        placeholder="Search tasks…"
                        class="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                </div>

                <!-- Type filter -->
                <UiSelect v-model="filters.type_id" class="!w-auto">
                    <option :value="null">All types</option>
                    <option v-for="t in taskTypes" :key="t.id" :value="t.id">{{ t.title }}</option>
                </UiSelect>

                <!-- Tag filter -->
                <div class="relative flex items-center">
                    <svg class="absolute left-2.5 w-3.5 h-3.5 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
                    </svg>
                    <input
                        v-model="filters.tag"
                        type="text"
                        placeholder="Filter by tag…"
                        class="pl-8 pr-3 py-1.5 text-sm rounded-lg border transition-colors w-36 focus:w-48"
                        :class="filters.tag
                            ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                            : 'border-gray-200 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white placeholder-gray-400'"
                        style="transition: width 0.2s ease, border-color 0.15s, background-color 0.15s;"
                    />
                    <button
                        v-if="filters.tag"
                        @click="filters.tag = ''"
                        class="absolute right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                        <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>

                <!-- User filter -->
                <div class="relative" ref="userDropdownEl">
                    <button
                        @click="toggleUserDropdown()"
                        class="flex items-center gap-1.5 py-1.5 pl-2.5 pr-2 text-sm rounded-lg border transition-colors"
                        :class="filters.user_id
                            ? 'border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'"
                    >
                        <UserIcon v-if="selectedFilterUser" avatar-size="xs" :user="selectedFilterUser" />
                        <svg v-else class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                        <span class="text-sm">{{ selectedFilterUser ? selectedFilterUser.name : 'Assignee' }}</span>
                        <svg
                            v-if="filters.user_id"
                            @click.stop="filters.user_id = null"
                            class="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-0.5"
                            viewBox="0 0 20 20" fill="currentColor"
                        >
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                        <svg v-else class="w-3 h-3 text-gray-400 ml-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>

                    <Transition name="dropdown">
                        <div
                            v-if="userDropdownOpen"
                            class="absolute top-full left-0 mt-1 w-52 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg py-1 z-50"
                        >
                            <div class="px-2 pt-1.5 pb-1">
                                <input
                                    v-model="userSearch"
                                    type="text"
                                    placeholder="Search members…"
                                    class="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div class="max-h-48 overflow-y-auto">
                                <button
                                    v-for="user in filterUsers"
                                    :key="user.id"
                                    @click="selectFilterUser(user)"
                                    class="flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors"
                                    :class="filters.user_id === user.id
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'"
                                >
                                    <UserIcon avatar-size="xs" :user="user" />
                                    <span class="truncate">{{ user.name }}</span>
                                </button>
                                <p v-if="!filterUsers.length" class="text-xs text-gray-400 dark:text-gray-500 px-3 py-2 text-center">No members found</p>
                            </div>
                        </div>
                    </Transition>
                </div>

                <!-- Clear filters -->
                <button
                    v-if="hasActiveFilters"
                    @click="clearFilters"
                    class="flex items-center gap-1 py-1.5 px-2.5 text-xs font-medium rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                    <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                    Clear
                </button>

                <!-- Divider -->
                <div class="ml-auto h-5 w-px bg-gray-200 dark:bg-gray-600"></div>

                <!-- Group by -->
                <div class="relative" ref="groupDropdownEl">
                    <button
                        @click="toggleGroupDropdown()"
                        class="flex items-center gap-1.5 py-1.5 pl-2.5 pr-2 text-sm rounded-lg border transition-colors"
                        :class="groupBy !== 'status'
                            ? 'border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'"
                    >
                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                        </svg>
                        <span class="text-sm">Group: {{ groupByLabel }}</span>
                        <svg class="w-3 h-3 text-gray-400 ml-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>

                    <Transition name="dropdown">
                        <div
                            v-if="groupDropdownOpen"
                            class="absolute top-full right-0 mt-1 w-40 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg py-1 z-50"
                        >
                            <button
                                v-for="opt in groupByOptions"
                                :key="opt.value"
                                @click="selectGroupBy(opt.value)"
                                class="flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors"
                                :class="groupBy === opt.value
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'"
                            >
                                <svg class="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path :d="opt.icon" />
                                </svg>
                                {{ opt.label }}
                                <svg v-if="groupBy === opt.value" class="w-3.5 h-3.5 ml-auto text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                </svg>
                            </button>
                        </div>
                    </Transition>
                </div>
            </div>
        </div>

        <!-- Kanban columns — status always stays, groupBy controls swimlane grouping within each column -->
        <div
            class="flex gap-3 overflow-x-auto pb-2"
            :key="boardState.activeBoard?.id?.toString()"
        >
            <StatusRow
                v-for="status in boardState.taskStatuses"
                :key="status.id"
                :status="{ id: status.id, title: status.title }"
                :filters="filters"
                :group-by="groupBy"
            />
        </div>
    </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
    transition: opacity 0.1s ease, transform 0.1s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}
</style>
