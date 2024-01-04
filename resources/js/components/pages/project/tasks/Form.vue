<script setup>

import Modal from "../../../shared/Modal.vue";
import {useTasksStore} from "../../../../store/tasksStore.js";
import {FwbBadge, FwbButton, FwbCheckbox, FwbFileInput, FwbSelect} from "flowbite-vue";
import {reactive, ref, watch} from "vue";
import {useRoute} from "vue-router";
import Errors from "../../../shared/Errors.vue";
import Label from "../../../shared/Label.vue";
import Text from "../../../shared/Text.vue";
import Editor from "../../../shared/Editor.vue";
import UsersSelectInput from "../../../shared/SelectUsersInProject.vue";
import Button from "../../../shared/Button.vue";
import {useErrorsStore} from "../../../../store/errors.js";
import SelectTasks from "./partisals/Form/SelectTasks.vue";
import DatePicker from "../../../shared/DatePicker.vue";
import {DateTime} from "luxon";
import EditorHeader from "../../../shared/advancedEditor/EditorHeader.vue";
import _ from "lodash";
import {toast} from "vue3-toastify";
import router from "../../../../router/router.js";

const createTasks = useTasksStore();
const errorsStore = useErrorsStore();
const taskTypesList = ref([]);
const createMore = ref(false);
const editorRef = ref(null);
const route = useRoute();
const updateEditor = ref(Math.random());
const form = reactive({
  project_id: '',
  name: '',
  description: '',
  type_id: 3,
  files: [],
  status_id: null,
  user_id: null,
  due_date: null,
  related_tasks: [],
  tags: [],
})

const showForm = ref(false);
const statuses = ref([]);
const tasksStore = useTasksStore();
const projects = ref({
  data: []
});
const users = ref([]);
const loadData = () => {
  axios.get('/api/v1/projects?can-create-task=true').then((res) => {
    projects.value = res.data;
  })
  axios.get('/api/v1/task-types').then(res => {
    taskTypesList.value = res.data;
  })

  if (route.query.task) {
    axios.get(`/api/v1/tasks/${route.query.task}`).then((res) => {
      const data = res.data.data;
      form.name = data.name;
      form.status_id = data.status.id;
      form.description = data.description;
      form.user_id = data.user.id;
      form.project_id = route.params.project;
        form.type_id = data.type.id;
        form.tags = data.tags ?? [];
      form.due_date = data.due_date === null ? null : DateTime.fromISO(data.due_date).toLocaleString(DateTime.DATE_FULL);
    }).finally(() => {
      showForm.value = true;
      updateEditor.value = Math.random();
    })

    axios.get(`/api/v1/tasks-statuses/`, {
      params: {
        project_id: route.params.project
      }
    }).then((res) => {
      statuses.value = res.data.data;
    })
  }

  if (!route.query.task) {
    showForm.value = true;
  }
}
const resetForm = () => {
  form.files = [];
  form.name = '';
  form.description = '';
  form.user_id = null;
    form.project_id = route.params.project ?? '';
  form.type_id = 3;
  form.status_id = null;
  form.due_date = null;
  form.related_tasks = [];
  form.tags = [];
}

watch(() => createTasks.showCreateTasksModal, () => {
  if (!createTasks.showCreateTasksModal) {
    resetForm();
  }
  if (createTasks.showCreateTasksModal) {
    loadData();
  }
}, {
  immediate: true
})

watch(() => route.params.project, () => {
  form.project_id = route.params.project
}, {
  immediate: true,
  deep: true
})


const submit = () => {
  if (route.query.task) {
    delete form.files;
    form.related_tasks = form.related_tasks.map(obj => {
      return {
        task_id: obj.task.id,
        task_relation_id: obj.task_relation_id
      }
    })
    axios.put(`/api/v1/tasks/${route.query.task}`, form).then(() => createTasks.toggleCreateTaskModal())

  }
  if (!route.query.task) {
    createNewTask();
  }
  if(route.name === 'project.tasks'){
    const withoutNulls = _.omitBy(route.query, _.isNull);
    withoutNulls.project_id = route.params.project;
    tasksStore.loadTasks(withoutNulls)
  }
}
const createNewTask = () => {
  errorsStore.setErrors({});
  const data = new FormData();
  data.append('project_id', form.project_id);
  data.append('name', form.name);
  data.append('description', JSON.stringify(form.description));
  form.related_tasks.map((obj, index) => {
    data.append(`related_tasks[${index}][task_id]`, obj.task.id);
    data.append(`related_tasks[${index}][task_relation_id]`, obj.task_relation_id);
  });

  form.tags.map((str, index) => {
    data.append(`tags[${index}]`, str);
  });

    if (form.due_date) {
        data.append('due_date', form.due_date);
    }
    if (form.user_id) {
        data.append('user_id', form.user_id);
    }
  data.append('type_id', form.type_id);

  form.files.forEach((obj, index) => {
    data.append(`file.${index}`, obj);
  })
  axios.post('/api/v1/tasks', data).then((task) => {
    resetForm();
      console.log(task)
    if (!createMore.value) {
      createTasks.toggleCreateTaskModal();
        toast.success(`<p>Task ${task.data.data.name} created. </p><small>click to open</small>`, {
            theme: localStorage.getItem('color-theme') ?? 'light',
            dangerouslyHTMLString: true,
            onClick: () => {
                router.push(`/open/${task.data.data.task_id}`)
            }
        })
    }
  }).catch((error) => {
    if (error.response.status === 422) {
      errorsStore.setErrors(error.response.data.errors, 'login')
    }
  })
}


const addTags =
    (e) => {
      if (form.tags.indexOf(e.target.value) === -1) {
        form.tags.push(e.target.value);
        e.target.value = '';
      }
    }
</script>

<template>
  <Teleport to="body">
    <Modal :hide-modal="createTasks.showCreateTasksModal" @closed="createTasks.toggleCreateTaskModal">
      <template #header>
        <h1>
            Create new task
        </h1>
      </template>
      <template #body>
        <form @submit.prevent="submit" v-if="showForm">
          <div class="mb-4">
              <fwb-select
                  :key="form.project_id"
                  v-model="form.project_id"
                  :options="projects.data.map(obj => {
                                   return {
                                       value: obj.id, name: obj.name
                                   }
                                })"
                  placeholder="Select project for task"
                  label="Project"
              />
              <Errors name="project_id"/>
            <fwb-select
                v-model="form.type_id"
                :options="taskTypesList.map(obj => {
                                   return {
                                       value: obj.id, name: obj.title
                                   }
                                })"
                placeholder="Select task type"
                label="Type"
            />
              <Errors name="type_id"/>

          </div>
          <div class="mb-4" v-if="route.query.task">
            <Label :forInput="'title'">Status</Label>
            <fwb-select
                v-model="form.status_id"
                :options="statuses.map(obj => {
                                   return {
                                       value: obj.id, name: obj.title
                                   }
                                })"
                placeholder="Select task type"
            />
            <Errors name="name"/>
          </div>
          <div class="mb-4">
            <Label :forInput="'title'">Title</Label>
            <Text type="title" v-model="form.name" placeholder="Task title"
                  :name="'title'"/>
            <Errors name="name"/>
          </div>
          <div class="mb-4" :key="updateEditor.toString()">
            <Label :forInput="'description'">Description</Label>
            <EditorHeader v-if="editorRef" :editor="editorRef.editor" />
            <Editor ref="editorRef" v-model="form.description" @submitted="submit"
                    css-class="input big-input"/>
            <Errors name="description"/>
          </div>
          <div class="mb-4" v-if="!route.query.task">
            <fwb-file-input v-model="form.files" label="Upload file" multiple/>
            <div v-if="form.files.length !== 0"
                 class="mt-4 border-[1px] border-gray-300 dark:border-gray-600 dark:text-white p-2 rounded-md">
              <div v-for="file in form.files" :key="file">
                {{ file.name }}
              </div>
            </div>
          </div>
          <div class="mb-4">
            <Label :forInput="'due_date'">Due date</Label>
            <DatePicker v-model="form.due_date"/>
            <Errors name="description"/>
          </div>
          <div class="mb-4">
            <Label :forInput="'due_date'">Tags</Label>
            <Text @keydown.enter.prevent="addTags"/>
            <div class="flex gap-1 mt-2 flex-wrap">
              <fwb-badge v-for="(str, index) in form.tags">{{ str }}
                <span @click="() => form.tags.splice(index, 1)" class="ml-2 cursor-pointer">x</span>
              </fwb-badge>
            </div>
            <Errors name="description"/>
          </div>
          <div class="mb-4">
            <Label :forInput="'user'">Assigned to</Label>
            <UsersSelectInput v-model="form.user_id" :key="form.user_id"/>
            <Errors name="user_id"/>
          </div>

          <div class="mb-4">
            <Label :forInput="'related_tasks'">Related to</Label>
            <SelectTasks @update="(value) => {
              form.related_tasks = value}"/>
            <Errors name="related_tasks"/>
          </div>

          <button type="hidden"></button>
        </form>

      </template>
      <template #footer>
        <div class="flex gap-4 items-center">
          <fwb-button @click="submit">
            Save
          </fwb-button>
          <fwb-checkbox v-if="!route.query.task" v-model="createMore" label="Create more tasks"/>
        </div>
      </template>
    </Modal>
  </Teleport>
</template>

<style scoped>

</style>
