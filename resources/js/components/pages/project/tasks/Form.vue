<script setup>
import { useTasksStore } from "@/store/tasksStore.js";
import { computed, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import Errors from "@/components/shared/Errors.vue";
import Editor from "@/components/pages/project/tasks/partisals/Form/Editor.vue";
import UsersSelectInput from "@/components/shared/SelectUsersInProject.vue";
import Button from "@/components/shared/Button.vue";
import { useErrorsStore } from "@/store/errors";
import SelectTasks from "@/components/pages/project/tasks/partisals/Form/SelectTasks.vue";
import DatePicker from "@/components/shared/DatePicker.vue";
import { DateTime } from "luxon";
import { toast } from "vue3-toastify";
import router from "@/router/router.js";
import { setFormData } from "@/components/pages/project/tasks/formLogic";
import Tags from "@/components/pages/project/tasks/partisals/Form/Tags.vue";
import UiToggle from "@/components/shared/ui/Toggle.vue";
import UiSelect from "@/components/shared/ui/Select.vue";
import SearchSelect from "@/components/shared/ui/SearchSelect.vue";

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
    sprint_id: "",
});

const showForm = ref(false);
const statuses = ref([]);
const existingRelations = ref([]);
const tasksStore = useTasksStore();
const projects = ref();
const boards = ref([]);

const projectOptions = computed(() =>
    (projects.value?.data ?? []).map(p => ({ value: p.id.toString(), label: p.name }))
);

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
                form.sprint_id = data.status?.sprint?.id?.toString() ?? "";
                form.due_date =
                    data.due_date === null
                        ? null
                        : DateTime.fromISO(data.due_date).toLocaleString(DateTime.DATE_FULL);
            })
            .finally(() => { showForm.value = true; });

        window.axios
            .get(`/api/v1/tasks-statuses/`, { params: { project_id: route.params.project } })
            .then((res) => { statuses.value = res.data.data; });

        window.axios
            .get(`/api/v1/task/load/${route.query.task}/relations`, { params: { project_id: route.params.project } })
            .then((res) => {
                existingRelations.value = (res.data.data || []).map((obj) => ({
                    task: { id: obj.id, task_id: obj.task_id, name: obj.name },
                    task_relation_id: obj.relation?.id?.toString() ?? "",
                }));
                form.related_tasks = existingRelations.value;
            });
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
    existingRelations.value = [];
    form.tags = [];
    form.sprint_id = "";
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
        if (newProjectId !== oldProjectId && oldProjectId) {
            form.user_id = null;
            form.sprint_id = "";
        }
        if (newProjectId) {
            window.axios.get("/api/v1/boards", { params: { project_id: newProjectId } })
                .then((res) => { boards.value = res.data; });
        } else {
            boards.value = [];
        }
    },
    { immediate: true }
);

const submit = () => {
    document.activeElement?.blur();
    if (route.query.task) {
        delete form.files;
        form.related_tasks = form.related_tasks.map((obj) => ({
            task_id: obj.task.id,
            task_relation_id: obj.task_relation_id,
        }));
        const sprintId = form.sprint_id;
        const { sprint_id: _, ...updateData } = form;
        window.axios
            .put(`/api/v1/tasks/${route.query.task}`, updateData)
            .then((res) => {
                const taskDbId = res.data?.data?.id ?? route.query.task;
                if (sprintId) {
                    window.axios.put("/api/v1/sprint/tasks", { task_id: taskDbId, sprint_id: sprintId })
                        .finally(() => createTasks.toggleCreateTaskModal());
                } else {
                    createTasks.toggleCreateTaskModal();
                }
            });
    }
    if (!route.query.task) createNewTask();
    if (route.name === "project.tasks") {
        const withoutNulls = Object.fromEntries(Object.entries(route.query).filter(([, v]) => v !== null));
        withoutNulls.project_id = route.params.project;
        tasksStore.loadTasks(withoutNulls);
    }
};

const createNewTask = () => {
    errorsStore.setErrors({}, "");
    const data = setFormData(form);
    const sprintId = form.sprint_id;
    window.axios
        .post("/api/v1/tasks", data)
        .then((task) => {
            const taskDbId = task.data.data.id;
            const taskId = task.data.data.task_id;
            const taskName = task.data.data.name;
            const afterCreate = () => {
                resetForm();
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
            };
            if (sprintId) {
                window.axios.put("/api/v1/sprint/tasks", { task_id: taskDbId, sprint_id: sprintId })
                    .then(afterCreate).catch(afterCreate);
            } else {
                afterCreate();
            }
        })
        .catch((error) => {
            if (error.response?.status === 422) {
                errorsStore.setErrors(error.response.data.errors, "login");
            }
        });
};

const isEditMode = () => Boolean(route.query.task);

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
                <div class="panel w-full sm:w-[680px] flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-2xl border-l border-gray-100 dark:border-gray-800 overflow-hidden">

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
                                        <SearchSelect
                                            v-model="form.project_id"
                                            :options="projectOptions"
                                            placeholder="Select project"
                                            search-placeholder="Search projects..."
                                        />
                                        <Errors name="project_id" />
                                    </div>

                                    <!-- Type -->
                                    <div>
                                        <label :class="labelClass">Type</label>
                                        <UiSelect v-model="form.type_id">
                                            <option value="">Select type</option>
                                            <option v-for="t in taskTypesList" :key="t.id" :value="t.id.toString()">{{ t.title }}</option>
                                        </UiSelect>
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

                                    <!-- Board / Sprint -->
                                    <div v-if="boards.some(b => b.sprint?.length)">
                                        <label :class="labelClass">Board</label>
                                        <UiSelect v-model="form.sprint_id">
                                            <option value="">No board</option>
                                            <template v-for="b in boards.filter(b => b.sprint?.length)" :key="b.id">
                                                <option v-if="b.type === 'kanban'" :value="b.sprint[0].id.toString()">{{ b.title }}</option>
                                                <optgroup v-else :label="b.title">
                                                    <option v-for="s in b.sprint" :key="s.id" :value="s.id.toString()">{{ s.title }}</option>
                                                </optgroup>
                                            </template>
                                        </UiSelect>
                                    </div>
                                </div>

                                <!-- Status (edit mode only) -->
                                <div v-if="isEditMode()" class="mt-3">
                                    <label :class="labelClass">Status</label>
                                    <UiSelect v-model="form.status_id">
                                        <option value="">Select status</option>
                                        <option v-for="s in statuses" :key="s.id" :value="s.id.toString()">{{ s.title }}</option>
                                    </UiSelect>
                                </div>

                                <!-- Tags -->
                                <div class="mt-3">
                                    <label :class="labelClass">Tags</label>
                                    <Tags v-model="form.tags" />
                                </div>

                                <!-- Related tasks -->
                                <div class="mt-3">
                                    <label :class="labelClass">Related to</label>
                                    <SelectTasks :initial-items="existingRelations" @update="(value) => { form.related_tasks = value; }" />
                                    <Errors name="related_tasks" />
                                </div>
                            </div>

                            <button class="hidden" type="submit" />
                        </form>
                    </div>

                    <!-- Footer -->
                    <div class="flex items-center gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0 bg-white dark:bg-gray-900">
                        <!-- Create more toggle -->
                        <UiToggle v-if="!isEditMode()" v-model="createMore" class="mr-auto">
                            Create more
                        </UiToggle>

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
