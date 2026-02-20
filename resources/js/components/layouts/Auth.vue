<script lang="js" setup>
//@ts-ignore
import Sidebar from "./Sidebar.vue";
//@ts-ignore
import Breadcrumb from "../header/Breadcrumb.vue";
import CreateTaskForm from "../pages/project/tasks/Form.vue";
</script>

<template>
  <div class="text-gray-900 dark:text-white print:hidden min-h-screen">
    <Sidebar />
    <div class="lg:ml-64 flex flex-col min-h-screen">
      <!-- Mobile spacer for hamburger button -->
      <div class="h-14 lg:hidden flex-shrink-0"></div>
      <div class="px-2 pt-4 sm:px-4 flex flex-col gap-4 pb-4">
        <slot></slot>
      </div>
    </div>
    <CreateTaskForm />
  </div>
</template>

<style scoped></style>
