<script setup>
import TaskStatusDropdown from "./TaskStatusDropdown.vue";

defineProps({
    status: null,
    taskId: null,
})
</script>

<template>
  <template v-if="status">
    <div class="text-xs text-gray-400 dark:text-gray-500 mb-1.5" v-if="status.board?.title">
      {{ status.board.title }}
      <span v-if="status.sprint?.title">({{ status.sprint.title }})</span>
    </div>
    <TaskStatusDropdown :obj="status" :taskId="taskId" />
  </template>
  <p v-else class="text-sm text-gray-400 dark:text-gray-500">—</p>
</template>

