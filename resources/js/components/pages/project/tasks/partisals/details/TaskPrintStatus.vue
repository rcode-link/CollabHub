<script setup>

import _ from "lodash";
import {FwbBadge} from "flowbite-vue";

defineProps({
  status: null
})
</script>

<template>
  <template v-if="status">
    <div v-if="_.isArray(status)"  v-for="obj in status" class="grid grid-cols-2 gap-1 border-b pb-1 pt-1">
      <div>
        {{ obj.board.title }} ({{ obj.sprint.title }})
      </div>

      <fwb-badge :type="obj.open ? 'default' : 'green'">
        {{ obj.title }}
      </fwb-badge>
    </div>
    <div>
      <fwb-badge  v-if="!_.isArray(status)" :type="'green'">
        {{ status.title }}
      </fwb-badge>
    </div>
  </template>
</template>

<style scoped>

</style>
