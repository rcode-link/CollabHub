<script setup lang="ts">

import {FwbBadge, FwbCard} from "flowbite-vue";

const props = defineProps({
  createdAt: null
})

</script>

<template>
  <div class="sticky top-0  w-full bg-gray-100 dark:bg-gray-900 text-center z-10" >
      {{ createdAt }}
  </div>
</template>

<style scoped>

</style>
