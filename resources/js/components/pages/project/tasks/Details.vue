<script setup lang="ts">
import { FwbBadge, FwbButton, FwbModal, FwbTab, FwbTabs } from "flowbite-vue";
import { useRoute, useRouter } from "vue-router";
import { onMounted, ref, watch } from "vue";
import Label from "../../../shared/Label.vue";
import Editor from "../../../shared/Editor.vue";
import User from "./User.vue";
import useClipboard from "vue-clipboard3";
import PrintFiles from "../../../shared/PrintFiles.vue";
import Comments from "./partisals/details/Comments.vue";
import UsersSelectInput from "../../../shared/SelectUsersInProject.vue";
import { useTasksStore } from "../../../../store/tasksStore.js";
import Relations from "./partisals/details/Relations.vue";
import { DateTime } from "luxon";
import { Tippy } from "vue-tippy";
import TimeSheet from "./partisals/details/time_sheet/index.vue";
import CopyIcon from "../../../shared/icons/CopyIcon.vue";
import TaskPrintStatus from "./partisals/details/TaskPrintStatus.vue";
import PencilIcon from "../../../shared/icons/PencilIcon.vue";

const { toClipboard } = useClipboard();
const route = useRoute();
const router = useRouter();
const data = ref([]);
const statuses = ref([]);
const activeTab = ref("");
const activeUser = ref(null);
const createTasks = useTasksStore();
const closeTask = () => {
  router.push({
    params: route.params,
    query: {
      ...route.query,
      task: null,
    },
  });
};

const getTask = () => {
  if (!route.query.task) {
    return;
  }
  axios
    .get(`/api/v1/tasks/${route.query.task}`, {
      params: {
        board_id: route.params.board,
      },
    })
    .then((res) => {
      data.value = res.data.data;
      activeUser.value = res.data.data.user ? res.data.data.user.id : null;
    });
};

onMounted(() => {
  getTask();
  axios
    .get(`/api/v1/tasks-statuses/`, {
      params: {
        project_id: route.params.project,
      },
    })
    .then((res) => {
      statuses.value = res.data.data;
    });

  Echo.private(`task-updated.task.${route.query.task}`).listen(
    "TaskUpdatedEvent",
    ({ task }) => {
      data.value = task;
      activeUser.value = task.user ? task.user.id : null;
    }
  );
});
watch(
  () => route.query.task,
  () => {
    getTask();
  },
  {
    deep: true,
  }
);

watch(activeUser, (value, oldValue, onCleanup) => {
  if (data.value.user?.id === activeUser.value) {
    return;
  }
  updateTask({
    user_id: activeUser.value,
  });
});
const tippyMessage = ref("Click to copy link for task");

const addToClipboard = async (value) => {
  try {
    await toClipboard(window.location.href);
    tippyMessage.value = "Link copied to clipboard";
    setTimeout(
      () => (tippyMessage.value = "Click to copy link for task"),
      2000
    );
  } catch (e) {}
};

const updateTask = (params) => {
  axios.put(`/api/v1/tasks/${route.query.task}`, {
    ...params,
    sprint_id: route.params.sprint,
  });
};
</script>

<template>
  <fwb-modal size="7xl" class="z-50" @close="closeTask">
    <template #header>
      <fwb-button
        color="light"
        class="mr-2"
        @click="createTasks.toggleCreateTaskModal"
      >
        <PencilIcon class="w-4 h-4" />
      </fwb-button>
      <h1 class="flex gap-2">
        {{ data.name }}
        <fwb-badge>{{ data?.type?.title }}</fwb-badge>
      </h1>
    </template>
    <template #body>
      <div
        class="grid grid-cols-1 z-50 md:grid-cols-3 gap-4"
        :key="route.query.task + JSON.stringify(data)"
      >
        <div class="col-span-2">
          <div class="mb-6">
            <Label>Description</Label>
            <Editor
              v-if="data.description"
              class="input big-input"
              :model="data.description"
              :editable="false"
            />
            <div v-if="!data.description" class="input big-input"></div>
          </div>
          <fwb-tabs v-model="activeTab" variant="pills" class="p-5">
            <fwb-tab name="media" title="Media">
              <div class="grid grid-cols-2 gap-1">
                <PrintFiles :full="true" :media="data.media" />
              </div>
            </fwb-tab>
            <fwb-tab name="comments" title="Comments" :disabled="!data.chat_id">
              <Comments
                v-if="activeTab === 'comments'"
                :chat-id="data.chat_id"
              />
            </fwb-tab>

            <fwb-tab name="relations" title="Relations">
              <Relations />
            </fwb-tab>
            <fwb-tab name="fourth" title="Time Sheet">
              <TimeSheet :task-id="data.id" />
            </fwb-tab>
          </fwb-tabs>
        </div>
        <div class="flex flex-col gap-4">
          <Label class="flex gap-1 items-center">
            Code: {{ data.task_id }}
            <tippy
              @click="addToClipboard(data.task_id)"
              :content="tippyMessage"
              :hide-on-click="false"
            >
              <CopyIcon class="w-4 h-4" />
            </tippy>
          </Label>
          <Label>
            Due date:
            <span v-if="data.due_date">{{
              DateTime.fromISO(data.due_date).toLocaleString(
                DateTime.DATE_SHORT
              )
            }}</span>
          </Label>
          <Label>
            Tags
            <div class="flex gap-1 mt-2 flex-wrap">
              <fwb-badge v-for="(str, index) in data.tags" :key="index">{{
                str
              }}</fwb-badge>
            </div>
          </Label>
          <Label>
            <div>Status</div>
            <TaskPrintStatus :status="data.status" :taskId="data.id" />
          </Label>
          <Label
            >Assigned to
            <UsersSelectInput :show-clean-input="false" v-model="activeUser" />
          </Label>
          <Label
            >Created by
            <User
              v-if="data.createdBy"
              show-name="true"
              :user="data.createdBy"
            />
          </Label>
        </div>
      </div>
    </template>
    <template #footer> </template>
  </fwb-modal>
</template>

<style scoped>
</style>
