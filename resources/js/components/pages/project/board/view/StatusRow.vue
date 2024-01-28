<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useBoardsState } from "../../../../../store/boards";
//@ts-ignore
import Card from "../../../../shared/Card.vue";
//@ts-ignore
import SingleTask from "./SingleTask.vue";
import { FwbButton } from "flowbite-vue";

const boardsStore = useBoardsState();
const route = useRoute();
const currentPage = ref<number>(1);
const lastLoadedPage = ref<number>(1);
const props = defineProps<{
  status: {
    title: string;
    id: string;
    sprint: string;
    project: string;
  };
}>();
const loadTaskForStatus = (): void => {
  if (lastLoadedPage.value === currentPage.value && lastLoadedPage.value > 1) {
    return;
  }

  boardsStore.setTasks(props.status.title, [], currentPage.value);
  if (!route.params.sprint) {
    return;
  }
  window.axios
    .get("/api/v1/tasks", {
      params: {
        page: currentPage.value,
        status_id: props.status.id,
        sprint_id: route.params.sprint,
        project_id: route.params.project,
      },
    })
    .then((res) => {
      lastLoadedPage.value = currentPage.value;
      boardsStore.setTasks(
        props.status.title,
        res.data.data,
        currentPage.value
      );
      if (res.data.data.length === 10) {
        currentPage.value++;
      }
    });
};

onMounted(() => {
  loadTaskForStatus();
});
</script>

<template>
  <div class="flex-1 min-w-[300px] h-[98vh] overflow-auto">
    <Card class="mb-4 sticky z-10 top-0">
      <h1>{{ status.title }}</h1>
    </Card>
    <div @dragover="(e) => boardsStore.changeTaskStatus(status)">
      <template v-for="obj in boardsStore.boardTasks[status.title]" :key="obj">
        <SingleTask :obj="obj" />
      </template>
      <fwb-button
        v-if="!boardsStore.draggedTask && lastLoadedPage !== currentPage"
        @click="() => loadTaskForStatus()"
        class="w-full"
      >
        Load More
      </fwb-button>
      <Card
        class="p-10"
        v-if="
          boardsStore.draggedTask &&
          boardsStore.draggedTask.status.id !== status.id
        "
      >
        Change status to {{ status.title }}
      </Card>
    </div>
  </div>
</template>