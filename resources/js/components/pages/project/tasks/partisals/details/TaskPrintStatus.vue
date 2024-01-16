<script setup lang="ts">

import _ from "lodash";
import TaskStatusDropdown from "./TaskStatusDropdown.vue";

defineProps({
    status: null,
    taskId: null,
})

</script>

<template>
  <template v-if="status">
    <div v-if="_.isArray(status)"  v-for="obj in status" class="grid grid-cols-2 gap-1 border-b pb-1 pt-1">
      <div>
          {{ obj.board?.title }}
          <template v-if="obj.sprint.title">
              ({{ obj.sprint.title }})
          </template>
      </div>
        <TaskStatusDropdown :obj="obj" :taskId="taskId"/>
    </div>
    <div>
        <TaskStatusDropdown v-if="!_.isArray(status)" :obj="status" :taskId="taskId"/>
    </div>
  </template>
</template>

