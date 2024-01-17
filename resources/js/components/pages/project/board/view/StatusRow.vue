<script setup>

import Card from "../../../../shared/Card.vue";
import {ref} from "vue";
import {useRoute} from "vue-router";
import {useBoardsState} from "../../../../../store/boards.js";
import SingleTask from "./SingleTask.vue";
import {FwbButton} from "flowbite-vue";

const boardsStore = useBoardsState();
const route = useRoute();
const currentPage = ref(1);
const lastLoadedPage = ref(1);
const props = defineProps({
  status: {}
})
const loadTaskForStatus = () => {

  if (lastLoadedPage.value === currentPage.value && lastLoadedPage.value > 1) {
        return;
    }

  boardsStore.setTasks(props.status.title, [], currentPage.value);
  if (!route.params.sprint) {
    return;
  }
  axios.get('/api/v1/tasks', {
    params: {
        page: currentPage.value,
        status_id: props.status.id,
        sprint_id: route.params.sprint,
        project_id: route.params.project
    }
  }).then((res) => {
      lastLoadedPage.value = currentPage.value;
      boardsStore.setTasks(props.status.title, res.data.data, currentPage.value);
      if (res.data.data.length === 10) {
          currentPage.value++;
      }
  })
}

loadTaskForStatus();
</script>

<template>
  <div class="flex-1 min-w-[300px] h-[98vh] overflow-auto">
    <Card class="mb-4 sticky z-10 top-0">
      <h1>{{ status.title }}</h1>
    </Card>
    <div
        @dragover="(e) => boardsStore.changeTaskStatus(status)"
    >
      <template v-for="obj in boardsStore.boardTasks[status.title]" :key="boardsStore.boardTasks[status.title].length">
        <SingleTask :obj="obj"/>
      </template>
        <fwb-button v-if="!boardsStore.draggedTask && lastLoadedPage !== currentPage" @click="() => loadTaskForStatus()" class="w-full">
            Load More
        </fwb-button>
      <Card class="p-10" v-if="boardsStore.draggedTask && boardsStore.draggedTask.status.id !== status.id">
        Change status to {{ status.title }}
      </Card>
    </div>
  </div>
</template>

<style scoped>

</style>
