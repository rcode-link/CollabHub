<script lang="js" setup>
//@ts-ignore
import Sidebar from '@/components/layouts/Sidebar.vue'
//@ts-ignore
import Breadcrumb from '@/components/header/Breadcrumb.vue'
import CreateTaskForm from '@/components/pages/project/tasks/Form.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white print:hidden">
    <Sidebar />
    <div class="lg:ml-64 flex flex-col">
      <!-- Mobile spacer for hamburger button -->
      <div class="lg:hidden flex-shrink-0" style="height: calc(3.5rem + env(safe-area-inset-top, 0px))"></div>
      <div class="px-2 pt-4 sm:px-4 flex flex-col gap-4 pb-4">
        <slot></slot>
      </div>
    </div>
    <CreateTaskForm />
  </div>
</template>

<style scoped></style>
