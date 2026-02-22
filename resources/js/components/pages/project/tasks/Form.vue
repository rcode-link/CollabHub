<script setup>
import { useTasksStore } from "../../../../store/tasksStore.js";
import { reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import Errors from "../../../shared/Errors.vue";
import Editor from "./partisals/Form/Editor.vue";
import UsersSelectInput from "../../../shared/SelectUsersInProject.vue";
import Button from "../../../shared/Button.vue";
import { useErrorsStore } from "../../../../store/errors";
import SelectTasks from "./partisals/Form/SelectTasks.vue";
import DatePicker from "../../../shared/DatePicker.vue";
import { DateTime } from "luxon";
import _ from "lodash";
import { toast } from "vue3-toastify";
import router from "../../../../router/router.js";
import { setFormData } from "./formLogic";
import Tags from "./partisals/Form/Tags.vue";

const errorsStore = useErrorsStore();
const createTasks = useTasksStore();
const taskTypesList = ref([]);
const createMore = ref(false);
const route = useRoute();
const form = reactive({
    project_id: "",
    name: "",
    description: "",
    type_id: "2",
    files: [],
    status_id: "",
    user_id: null,
    due_date: null,
    related_tasks: [],
    tags: [],
});

const showForm = ref(false);
const statuses = ref([]);
const tasksStore = useTasksStore();
const projects = ref();

const loadData = () => {
    window.axios.get("/api/v1/projects?can-create-task=true").then((res) => {
        projects.value = res.data;
    });
    window.axios.get("/api/v1/task-types").then((res) => {
        taskTypesList.value = res.data;
    });

    if (route.query.task) {
        window.axios
            .get(`/api/v1/tasks/${route.query.task}`)
            .then((res) => {
                const data = res.data.data;
                form.name = data.name;
                form.status_id = data.status?.id;
                form.description = data.description;
                form.user_id = data.user?.id ?? null;
                form.project_id = route.params.project;
                form.type_id = data.type.id;
                form.tags = data.tags ?? [];
                form.due_date =
                    data.due_date === null
                        ? null
                        : DateTime.fromISO(data.due_date).toLocaleString(DateTime.DATE_FULL);
            })
            .finally(() => { showForm.value = true; });

        window.axios
            .get(`/api/v1/tasks-statuses/`, { params: { project_id: route.params.project } })
            .then((res) => { statuses.value = res.data.data; });
    }

    if (!route.query.task) {
        showForm.value = true;
    }
};

const resetForm = () => {
    form.files = [];
    form.name = "";
    form.description = "";
    form.user_id = null;
    form.project_id = route.params.project ?? form.project_id ?? "";
    form.type_id = "2";
    form.status_id = "";
    form.due_date = null;
    form.related_tasks = [];
    form.tags = [];
};

watch(
    () => createTasks.showCreateTasksModal,
    () => {
        if (!createTasks.showCreateTasksModal) resetForm();
        if (createTasks.showCreateTasksModal) loadData();
    },
    { immediate: true }
);

watch(
    () => route.params.project,
    () => { if (route.params.project) form.project_id = route.params.project; },
    { immediate: true, deep: true }
);

watch(
    () => form.project_id,
    (newProjectId, oldProjectId) => {
        if (newProjectId !== oldProjectId && oldProjectId) form.user_id = null;
    }
);

const submit = () => {
    document.activeElement?.blur();
    if (route.query.task) {
        delete form.files;
        form.related_tasks = form.related_tasks.map((obj) => ({
            task_id: obj.task.id,
            task_relation_id: obj.task_relation_id,
        }));
        window.axios
            .put(`/api/v1/tasks/${route.query.task}`, form)
            .then(() => createTasks.toggleCreateTaskModal());
    }
    if (!route.query.task) createNewTask();
    if (route.name === "project.tasks") {
        const withoutNulls = _.omitBy(route.query, _.isNull);
        withoutNulls.project_id = route.params.project;
        tasksStore.loadTasks(withoutNulls);
    }
};

const createNewTask = () => {
    errorsStore.setErrors({}, "");
    const data = setFormData(form);
    window.axios
        .post("/api/v1/tasks", data)
        .then((task) => {
            resetForm();
            const taskId = task.data.data.task_id;
            const taskName = task.data.data.name;
            if (!createMore.value) {
                createTasks.toggleCreateTaskModal();
                router.push(`/open/${taskId}`);
            } else {
                toast.success(
                    `<p>Task ${taskName} created.</p><small>Click to open</small>`,
                    {
                        theme: localStorage.getItem("color-theme") ?? "light",
                        dangerouslyHTMLString: true,
                        onClick: () => { router.push(`/open/${taskId}`); },
                    }
                );
            }
        })
        .catch((error) => {
            if (error.response?.status === 422) {
                errorsStore.setErrors(error.response.data.errors, "login");
            }
        });
};

const isEditMode = () => Boolean(route.query.task);

const selectClass = "w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer";
const labelClass = "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1";
</script>

<template>
    <!-- Trigger button -->
    <div class="hidden lg:block">
        <Button size="sm" @click="createTasks.toggleCreateTaskModal">Add task</Button>
    </div>

    <Teleport to="body">
        <Transition name="task-drawer">
            <div
                v-if="createTasks.showCreateTasksModal"
                class="fixed inset-0 z-50 flex"
            >
                <!-- Backdrop -->
                <div
                    class="flex-1 bg-black/40 backdrop-blur-[2px]"
                    @click="createTasks.toggleCreateTaskModal"
                />

                <!-- Drawer panel -->
                <div class="panel w-full sm:w-[680px] flex flex-col bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-100 dark:border-gray-800 overflow-hidden">

                    <!-- Header -->
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
                        <h2 class="text-sm font-semibold text-gray-900 dark:text-white">
                            {{ isEditMode() ? 'Edit task' : 'New task' }}
                        </h2>
                        <button
                            @click="createTasks.toggleCreateTaskModal"
                            class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>

                    <!-- Loading -->
                    <div v-if="!showForm" class="flex-1 flex items-center justify-center">
                        <svg class="w-5 h-5 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 12a9 9 0 11-6.219-8.56"/>
                        </svg>
                    </div>

                    <!-- Scrollable body -->
                    <div v-else class="flex-1 overflow-y-auto">
                        <form @submit.prevent="submit">

                            <!-- Document area — title + editor -->
                            <div class="px-8 pt-7 pb-5">
                                <!-- Title -->
                                <input
                                    v-model="form.name"
                                    type="text"
                                    placeholder="Task title…"
                                    class="w-full text-[1.5rem] font-bold leading-snug text-gray-900 dark:text-white bg-transparent border-none outline-none placeholder-gray-300 dark:placeholder-gray-600 mb-4"
                                    autofocus
                                />
                                <Errors name="name" />

                                <!-- Description editor -->
                                <Editor v-model="form.description" />
                                <Errors name="description" />
                            </div>

                            <!-- Properties section -->
                            <div class="px-6 pb-4 border-t border-gray-100 dark:border-gray-800">
                                <p class="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mt-4 mb-3">Properties</p>

                                <div class="grid grid-cols-2 gap-3">
                                    <!-- Project -->
                                    <div>
                                        <label :class="labelClass">Project</label>
                                        <select :key="form.project_id" v-model="form.project_id" :class="selectClass">
                                            <option value="">Select project</option>
                                            <option
                                                v-for="p in projects?.data"
                                                :key="p.id"
                                                :value="p.id.toString()"
                                            >{{ p.name }}</option>
                                        </select>
                                        <Errors name="project_id" />
                                    </div>

                                    <!-- Type -->
                                    <div>
                                        <label :class="labelClass">Type</label>
                                        <select v-model="form.type_id" :class="selectClass">
                                            <option value="">Select type</option>
                                            <option v-for="t in taskTypesList" :key="t.id" :value="t.id.toString()">{{ t.title }}</option>
                                        </select>
                                        <Errors name="type_id" />
                                    </div>

                                    <!-- Assignee -->
                                    <div>
                                        <label :class="labelClass">Assigned to</label>
                                        <UsersSelectInput
                                            v-model="form.user_id"
                                            :project-id="form.project_id"
                                            :key="form.project_id + '-' + form.user_id"
                                        />
                                        <Errors name="user_id" />
                                    </div>

                                    <!-- Due date -->
                                    <div>
                                        <label :class="labelClass">Due date</label>
                                        <DatePicker v-model="form.due_date" />
                                    </div>
                                </div>

                                <!-- Status (edit mode only) -->
                                <div v-if="isEditMode()" class="mt-3">
                                    <label :class="labelClass">Status</label>
                                    <select v-model="form.status_id" :class="selectClass">
                                        <option value="">Select status</option>
                                        <option v-for="s in statuses" :key="s.id" :value="s.id.toString()">{{ s.title }}</option>
                                    </select>
                                </div>

                                <!-- Tags -->
                                <div class="mt-3">
                                    <label :class="labelClass">Tags</label>
                                    <Tags v-model="form.tags" />
                                </div>

                                <!-- Related tasks -->
                                <div class="mt-3">
                                    <label :class="labelClass">Related to</label>
                                    <SelectTasks @update="(value) => { form.related_tasks = value; }" />
                                    <Errors name="related_tasks" />
                                </div>
                            </div>

                            <button class="hidden" type="submit" />
                        </form>
                    </div>

                    <!-- Footer -->
                    <div class="flex items-center gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0 bg-white dark:bg-gray-900">
                        <!-- Create more toggle -->
                        <label v-if="!isEditMode()" class="flex items-center gap-2 cursor-pointer mr-auto">
                            <div class="relative">
                                <input type="checkbox" class="sr-only" v-model="createMore" />
                                <div class="w-8 h-4 rounded-full transition-colors" :class="createMore ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'"></div>
                                <div class="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform" :class="createMore ? 'translate-x-4' : 'translate-x-0'"></div>
                            </div>
                            <span class="text-xs text-gray-600 dark:text-gray-300">Create more</span>
                        </label>

                        <Button @click="submit" :disabled="!form.name.trim()">
                            {{ isEditMode() ? 'Save changes' : 'Create task' }}
                        </Button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
/* Backdrop fades, panel slides from right */
.task-drawer-enter-active .panel,
.task-drawer-leave-active .panel {
    transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}
.task-drawer-enter-from .panel,
.task-drawer-leave-to .panel {
    transform: translateX(100%);
}

/* Document editor styles applied via :deep */
:deep(.doc-editor .ProseMirror) {
    min-height: 180px;
    outline: none;
    font-size: 0.9375rem;
    line-height: 1.7;
    color: inherit;
}
:deep(.doc-editor .ProseMirror p) { margin: 0 0 0.5em; }
:deep(.doc-editor .ProseMirror h1) { font-size: 1.5em; font-weight: 700; margin: 0.75em 0 0.25em; }
:deep(.doc-editor .ProseMirror h2) { font-size: 1.25em; font-weight: 600; margin: 0.75em 0 0.25em; }
:deep(.doc-editor .ProseMirror h3) { font-size: 1.1em; font-weight: 600; margin: 0.75em 0 0.25em; }
:deep(.doc-editor .ProseMirror ul) { list-style: disc; padding-left: 1.4em; margin: 0.4em 0; }
:deep(.doc-editor .ProseMirror ol) { list-style: decimal; padding-left: 1.4em; margin: 0.4em 0; }
:deep(.doc-editor .ProseMirror blockquote) {
    border-left: 3px solid #e5e7eb;
    padding-left: 0.75em;
    color: #6b7280;
    margin: 0.5em 0;
}
:deep(.doc-editor .ProseMirror code) {
    background: rgba(0,0,0,0.05);
    border-radius: 3px;
    padding: 0.1em 0.3em;
    font-size: 0.9em;
    font-family: monospace;
}
:deep(.doc-editor .ProseMirror pre) {
    background: #1e293b;
    color: #e2e8f0;
    padding: 0.75em 1em;
    border-radius: 8px;
    overflow-x: auto;
    margin: 0.5em 0;
}
:deep(.doc-editor .ProseMirror img) {
    max-width: 100%;
    height: auto;
    border-radius: 6px;
    margin: 0.5em 0;
    cursor: default;
    display: block;
}
:deep(.doc-editor .ProseMirror a) {
    color: #3b82f6;
    text-decoration: underline;
}
:deep(.doc-editor .ProseMirror p.is-editor-empty:first-child::before) {
    content: attr(data-placeholder);
    color: #9ca3af;
    pointer-events: none;
    float: left;
    height: 0;
}
</style>
