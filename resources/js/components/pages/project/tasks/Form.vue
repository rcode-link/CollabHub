<script setup>
import Modal from "../../../shared/Modal.vue";
import { useTasksStore } from "../../../../store/tasksStore.js";
import {
  FwbBadge,
  FwbButton,
  FwbCheckbox,
  FwbFileInput,
  FwbSelect,
} from "flowbite-vue";
import { reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import Errors from "../../../shared/Errors.vue";
import Label from "../../../shared/Label.vue";
import Text from "../../../shared/Text.vue";
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
const statuses = ref();
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
            : DateTime.fromISO(data.due_date).toLocaleString(
                DateTime.DATE_FULL
              );
      })
      .finally(() => {
        showForm.value = true;
      });

    window.axios
      .get(`/api/v1/tasks-statuses/`, {
        params: {
          project_id: route.params.project,
        },
      })
      .then((res) => {
        statuses.value = res.data.data;
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
  form.project_id = route.params.project ?? "";
  form.type_id = "2";
  form.status_id = "";
  form.due_date = null;
  form.related_tasks = [];
  form.tags = [];
};

watch(
  () => createTasks.showCreateTasksModal,
  () => {
    if (!createTasks.showCreateTasksModal) {
      resetForm();
    }
    if (createTasks.showCreateTasksModal) {
      loadData();
    }
  },
  {
    immediate: true,
  }
);

watch(
  () => route.params.project,
  () => {
    form.project_id = route.params.project;
  },
  {
    immediate: true,
    deep: true,
  }
);

const submit = () => {
  if (route.query.task) {
    delete form.files;
    form.related_tasks = form.related_tasks.map((obj) => {
      return {
        task_id: obj.task.id,
        task_relation_id: obj.task_relation_id,
      };
    });
    window.axios
      .put(`/api/v1/tasks/${route.query.task}`, form)
      .then(() => createTasks.toggleCreateTaskModal());
  }
  if (!route.query.task) {
    createNewTask();
  }
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
      console.log(task);
      if (!createMore.value) {
        createTasks.toggleCreateTaskModal();
        toast.success(
          `<p>Task ${task.data.data.name} created. </p><small>click to open</small>`,
          {
            theme: localStorage.getItem("color-theme") ?? "light",
            dangerouslyHTMLString: true,
            onClick: () => {
              router.push(`/open/${task.data.data.task_id}`);
            },
          }
        );
      }
    })
    .catch((error) => {
      if (error.response.status === 422) {
        errorsStore.setErrors(error.response.data.errors, "login");
      }
    });
};

const projectList = () => {
  if (!projects.value) {
    return [{}];
  }
  return projects.value.data.map((obj) => {
    return {
      value: obj.id.toString(),
      name: obj.name,
    };
  });
};
</script>

<template>
  <fwb-button @click="createTasks.toggleCreateTaskModal" size="xs">
    Add new task
  </fwb-button>
  <Teleport to="#append-container">
    <Modal
      :hide-modal="createTasks.showCreateTasksModal"
      @closed="createTasks.toggleCreateTaskModal"
    >
      <template #header>
        <h1>Create new task</h1>
      </template>
      <template #body>
        <form @submit.prevent="submit" v-if="showForm">
          <div class="mb-4">
            <fwb-select
              :key="form.project_id"
              v-model="form.project_id"
              :options="projectList()"
              placeholder="Select project for task"
              label="Project"
            />
            <Errors name="project_id" />
            <fwb-select
              v-model="form.type_id"
              :options="
                taskTypesList?.map((obj) => {
                  return {
                    value: obj.id.toString(),
                    name: obj.title,
                  };
                })
              "
              placeholder="Select task type"
              label="Type"
            />
            <Errors name="type_id" />
          </div>
          <div class="mb-4" v-if="route.query.task">
            <Label :forInput="'title'">Status</Label>
            <fwb-select
              v-model="form.status_id"
              :options="
                statuses?.map((obj) => {
                  return {
                    value: obj.id.toString(),
                    name: obj.title,
                  };
                })
              "
              placeholder="Select task type"
            />
            <Errors name="name" />
          </div>
          <div class="mb-4">
            <Label :forInput="'title'">Title</Label>
            <Text
              type="title"
              v-model="form.name"
              placeholder="Task title"
              :name="'title'"
            />
            <Errors name="name" />
          </div>
          <div class="mb-4">
            <Label :forInput="'description'">Description</Label>
            <Editor v-model="form.description" />
            <Errors name="description" />
          </div>
          <div class="mb-4" v-if="!route.query.task">
            <fwb-file-input v-model="form.files" label="Upload file" multiple />
            <div
              v-if="form.files?.length !== 0"
              class="mt-4 border-[1px] border-gray-300 dark:border-gray-600 dark:text-white p-2 rounded-md"
            >
              <div v-for="file in form.files" :key="file">
                {{ file.name }}
              </div>
            </div>
          </div>
          <div class="mb-4">
            <Label :forInput="'due_date'">Due date</Label>
            <DatePicker v-model="form.due_date" />
            <Errors name="description" />
          </div>
          <div class="mb-4">
            <Label :forInput="'due_date'">Tags</Label>
            <Tags v-model="form.tags" />
            <Errors name="description" />
          </div>
          <div class="mb-4">
            <Label :forInput="'user'">Assigned to</Label>
            <UsersSelectInput v-model="form.user_id" :key="form.user_id" />
            <Errors name="user_id" />
          </div>

          <div class="mb-4">
            <Label :forInput="'related_tasks'">Related to</Label>
            <SelectTasks
              @update="
                (value) => {
                  form.related_tasks = value;
                }
              "
            />
            <Errors name="related_tasks" />
          </div>

          <button class="hidden"></button>
        </form>
      </template>
      <template #footer>
        <div class="flex gap-4 items-center">
          <fwb-button @click="submit"> Save </fwb-button>
          <fwb-checkbox
            v-if="!route.query.task"
            v-model="createMore"
            label="Create more tasks"
          />
        </div>
      </template>
    </Modal>
  </Teleport>
</template>

<style scoped>
</style>
