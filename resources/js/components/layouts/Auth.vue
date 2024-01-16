<script setup lang="ts">
import Menu from "../header/Menu.vue";
import Breadcrumb from "../header/Breadcrumb.vue";
import { FwbProgress } from "flowbite-vue";
import { useProgressBarStore } from "../../store/progressBarStore.js";
const progressBar = useProgressBarStore();
</script>

<template>
  <fwb-progress
    v-show="progressBar.present"
    :progress="progressBar.present"
    class="fixed top-0 left-0 right-0"
    size="sm"
  />

  <div class="text-gray-900 dark:text-white">
    <Menu id="menu" />
    <div class="container mx-auto px-2 sm:px-0 flex flex-col gap-4">
      <Breadcrumb class="mt-2" />

      <slot></slot>
    </div>
  </div>
</template>
<style scoped>
</style>
