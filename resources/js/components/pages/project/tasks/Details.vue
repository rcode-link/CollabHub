<script setup>
import { useRoute, useRouter } from "vue-router";
import { computed, onMounted, ref, watch } from "vue";
import Editor from "@/components/shared/Editor.vue";
import User from "@/components/pages/project/tasks/User.vue";
import useClipboard from "vue-clipboard3";
import PrintFiles from "@/components/shared/PrintFiles.vue";
import Comments from "@/components/pages/project/tasks/partisals/details/Comments.vue";
import UsersSelectInput from "@/components/shared/SelectUsersInProject.vue";
import { useTasksStore } from "@/store/tasksStore.js";
import Relations from "@/components/pages/project/tasks/partisals/details/Relations.vue";
import { DateTime } from "luxon";
import { Tippy } from "vue-tippy";
import TimeSheet from "@/components/pages/project/tasks/partisals/details/time_sheet/index.vue";
import CopyIcon from "@/components/shared/icons/CopyIcon.vue";
import TaskPrintStatus from "@/components/pages/project/tasks/partisals/details/TaskPrintStatus.vue";
import PencilIcon from "@/components/shared/icons/PencilIcon.vue";

const { toClipboard } = useClipboard();
const route = useRoute();
const router = useRouter();
const data = ref({});
const activeTab = ref("media");
const activeUser = ref(null);
const createTasks = useTasksStore();

const tabs = computed(() => [
    { id: "media", label: "Media" },
    { id: "comments", label: "Comments", disabled: !data.value.chat_id },
    { id: "relations", label: "Relations" },
    { id: "timesheet", label: "Time Sheet" },
]);

const closeTask = () => {
    router.push({ params: route.params, query: { ...route.query, task: null } });
};

const getTask = () => {
    if (!route.query.task) return;
    axios
        .get(`/api/v1/tasks/${route.query.task}`, { params: { board_id: route.params.board } })
        .then((res) => {
            data.value = res.data.data;
            activeUser.value = res.data.data.user ? res.data.data.user.id : null;
        });
};

onMounted(() => {
    getTask();
    Echo.private(`task-updated.task.${route.query.task}`).listen("TaskUpdatedEvent", ({ task }) => {
        data.value = task;
        activeUser.value = task.user ? task.user.id : null;
    });
});

watch(() => route.query.task, () => { getTask(); }, { deep: true });

watch(activeUser, () => {
    if (data.value.user?.id === activeUser.value) return;
    updateTask({ user_id: activeUser.value });
});

const tippyMessage = ref("Click to copy link");
const addToClipboard = async () => {
    try {
        await toClipboard(window.location.href);
        tippyMessage.value = "Copied!";
        setTimeout(() => (tippyMessage.value = "Click to copy link"), 2000);
    } catch (e) {}
};

const updateTask = (params) => {
    axios.put(`/api/v1/tasks/${route.query.task}`, { ...params, sprint_id: route.params.sprint });
};

const isLoaded = computed(() => Boolean(data.value.id));
</script>

<template>
    <Teleport to="body">
        <Transition name="taskmodal">
            <div
                v-if="route.query.task"
                class="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
            >
                <!-- Backdrop -->
                <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeTask" />

                <!-- Panel -->
                <div class="relative w-full max-w-6xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden" style="height: min(90vh, 860px)">

                    <!-- Header -->
                    <div class="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0 min-w-0">
                        <span class="text-xs font-mono text-gray-400 dark:text-gray-500 flex-shrink-0">{{ data.task_id }}</span>
                        <span
                            v-if="data.type?.title"
                            class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex-shrink-0"
                        >{{ data.type.title }}</span>
                        <h1 class="flex-1 min-w-0 text-sm font-semibold text-gray-900 dark:text-white truncate">{{ data.name }}</h1>

                        <div class="flex items-center gap-1 flex-shrink-0">
                            <tippy :content="tippyMessage" :hide-on-click="false">
                                <button
                                    @click="addToClipboard"
                                    class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <CopyIcon class="w-4 h-4" />
                                </button>
                            </tippy>
                            <button
                                @click="createTasks.toggleCreateTaskModal"
                                class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                title="Edit task"
                            >
                                <PencilIcon class="w-4 h-4" />
                            </button>
                            <button
                                @click="closeTask"
                                class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Loading state -->
                    <div v-if="!isLoaded" class="flex-1 flex items-center justify-center">
                        <svg class="w-6 h-6 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 12a9 9 0 11-6.219-8.56"/>
                        </svg>
                    </div>

                    <!-- Body -->
                    <div v-else class="flex flex-1 overflow-hidden" :key="route.query.task + JSON.stringify(data)">

                        <!-- Main content -->
                        <div class="flex-1 overflow-y-auto px-6 py-5 min-w-0">

                            <!-- Description -->
                            <div class="mb-6">
                                <h3 class="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3">Description</h3>
                                <div v-if="data.description" class="prose prose-sm dark:prose-invert max-w-none">
                                    <Editor :model="data.description" :editable="false" />
                                </div>
                                <p v-else class="text-sm text-gray-400 dark:text-gray-500 italic">No description provided.</p>
                            </div>

                            <!-- Tab nav -->
                            <div class="border-b border-gray-100 dark:border-gray-800 mb-5">
                                <nav class="flex">
                                    <button
                                        v-for="tab in tabs"
                                        :key="tab.id"
                                        @click="!tab.disabled && (activeTab = tab.id)"
                                        class="px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors"
                                        :class="[
                                            activeTab === tab.id
                                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                                : 'border-transparent hover:text-gray-700 dark:hover:text-gray-200',
                                            tab.disabled ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-500 dark:text-gray-400 cursor-pointer'
                                        ]"
                                    >
                                        {{ tab.label }}
                                    </button>
                                </nav>
                            </div>

                            <!-- Tab content -->
                            <div v-if="activeTab === 'media'">
                                <div v-if="data.media?.length" class="grid grid-cols-2 gap-2">
                                    <PrintFiles :full="true" :media="data.media" />
                                </div>
                                <p v-else class="text-sm text-gray-400 dark:text-gray-500 italic">No attachments.</p>
                            </div>
                            <div v-else-if="activeTab === 'comments'">
                                <Comments v-if="data.chat_id" :chat-id="data.chat_id" />
                            </div>
                            <div v-else-if="activeTab === 'relations'">
                                <Relations />
                            </div>
                            <div v-else-if="activeTab === 'timesheet'">
                                <TimeSheet :task-id="data.id" />
                            </div>
                        </div>

                        <!-- Sidebar -->
                        <div class="w-64 flex-shrink-0 border-l border-gray-100 dark:border-gray-800 overflow-y-auto px-4 py-5 space-y-5 bg-gray-50/50 dark:bg-gray-800/20">

                            <!-- Status -->
                            <div>
                                <label class="block text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">Status</label>
                                <TaskPrintStatus :status="data.status" :taskId="data.id" />
                            </div>

                            <!-- Assignee -->
                            <div>
                                <label class="block text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">Assignee</label>
                                <UsersSelectInput :show-clean-input="false" v-model="activeUser" />
                            </div>

                            <!-- Due date -->
                            <div>
                                <label class="block text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">Due date</label>
                                <div v-if="data.due_date" class="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                                    <svg class="w-4 h-4 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                    {{ DateTime.fromISO(data.due_date).toLocaleString(DateTime.DATE_FULL) }}
                                </div>
                                <p v-else class="text-sm text-gray-400 dark:text-gray-500">—</p>
                            </div>

                            <!-- Tags -->
                            <div>
                                <label class="block text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">Tags</label>
                                <div v-if="data.tags?.length" class="flex flex-wrap gap-1.5">
                                    <span
                                        v-for="(tag, idx) in data.tags"
                                        :key="idx"
                                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                    >{{ tag }}</span>
                                </div>
                                <p v-else class="text-sm text-gray-400 dark:text-gray-500">—</p>
                            </div>

                            <!-- Created by -->
                            <div v-if="data.createdBy">
                                <label class="block text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">Created by</label>
                                <User show-name="true" :user="data.createdBy" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.taskmodal-enter-active, .taskmodal-leave-active {
    transition: opacity 0.15s ease;
}
.taskmodal-enter-from, .taskmodal-leave-to {
    opacity: 0;
}
.taskmodal-enter-active .relative,
.taskmodal-leave-active .relative {
    transition: transform 0.15s ease;
}
.taskmodal-enter-from .relative,
.taskmodal-leave-to .relative {
    transform: translateY(8px);
}
</style>
