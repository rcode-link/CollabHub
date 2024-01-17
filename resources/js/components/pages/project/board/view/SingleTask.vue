<script setup>

import {DateTime} from "luxon";
import UserIcon from "../../../../shared/UserIcon.vue";
import {FwbBadge} from "flowbite-vue";
import Label from "../../../../shared/Label.vue";
import Card from "../../../../shared/Card.vue";
import {useBoardsState} from "../../../../../store/boards.js";
import {useRoute, useRouter} from "vue-router";
import {Tippy} from "vue-tippy";
import {computed} from "vue";

const boardsStore = useBoardsState();

const router = useRouter();
const route = useRoute();
const props = defineProps({
  obj: {}
})

const dragStarted = (e) => {
  boardsStore.setDraggedTaskId(props.obj);
  e.dataTransfer?.setDragImage(e.target, 0, 0);
};
const updateTask = () => {
  axios.put(`/api/v1/tasks/change-status`, {
    status_id: boardsStore.draggedTask.status.id,
    sprint_id: route.params.sprint,
    task_id: boardsStore.draggedTask.id
  }).then(() => boardsStore.setDraggedTaskId(null))
}

const openTask = () => {
  router.push({
    ...route,
    query: {
      ...route.query,
      task: props.obj.task_id
    }
  })
}

const userName = computed(() => {
    if(props.obj.user){
        return props.obj.user.name;
    }

    return 'Select user';
})
</script>

<template>
  <Card
      v-if="!boardsStore.draggedTask || boardsStore.draggedTask.id === obj.id"
      @dragstart="dragStarted"
      @dragend="(e) => {updateTask()}"
      @click="openTask"
      draggable="true" class="mb-1 flex-col justify-between cursor-pointer">
    <div>
      <h1 class="">
        {{ obj.name }}
      </h1>
      <Label>
        Due date: <span
          v-if="obj.due_date">{{ DateTime.fromISO(obj.due_date).toLocaleString(DateTime.DATE_SHORT) }}</span>
        <span v-else>None</span>
      </Label>
      <div class="flex gap-1 mt-2 flex-wrap">
        <fwb-badge v-for="(str, index) in obj.tags">{{ str }}</fwb-badge>
      </div>
    </div>
    <div class="flex justify-between items-center" :key="obj.task_id + userName">
      <h2>{{obj.task_id}}</h2>
      <tippy :content="userName">
          <UserIcon avatar-size="xs" :user="obj.user"/>
      </tippy>
    </div>
  </Card>
</template>

<style scoped>

</style>
