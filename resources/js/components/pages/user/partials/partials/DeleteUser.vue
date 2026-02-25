<script setup>
import Button from '@/components/shared/Button.vue'
import InteractiveToast from '@/components/shared/InteractiveToast.vue'
import { useSingleUserStore } from '@/store/singleUser'

const singleUserStore = useSingleUserStore()
</script>

<template>
  <interactive-toast>
    <template #trigger>
      <Button variant="danger">Delete</Button>
    </template>
    <template #title>
      You are about to delete user.
    </template>
    <template #content>
      Are you sure you want to delete user:
      <p class="text-sm text-gray-700 dark:text-gray-300">
        Name: {{ singleUserStore.user.name }}
      </p>
      <p class="text-sm text-gray-700 dark:text-gray-300">
        Email: {{ singleUserStore.user.email }}
      </p>
    </template>
    <template #actions>
      <Button variant="danger" size="sm" @click="singleUserStore.deleteUser">Yes, delete</Button>
    </template>
  </interactive-toast>
</template>
