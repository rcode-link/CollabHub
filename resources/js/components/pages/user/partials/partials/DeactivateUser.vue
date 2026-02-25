<script setup>
import Button from '@/components/shared/Button.vue'
import InteractiveToast from '@/components/shared/InteractiveToast.vue'
import { useSingleUserStore } from '@/store/singleUser'

const singleUserStore = useSingleUserStore()
</script>

<template>
  <interactive-toast>
    <template #trigger>
      <Button variant="soft">Deactivate</Button>
    </template>
    <template #title>
      You are about to deactivate user.
    </template>
    <template #content>
      Are you sure you want to deactivate user:
      <p class="text-sm text-gray-700 dark:text-gray-300">
        Name: {{ singleUserStore.user.name }}
      </p>
      <p class="text-sm text-gray-700 dark:text-gray-300">
        Email: {{ singleUserStore.user.email }}
      </p>
    </template>
    <template #actions>
      <Button variant="danger" size="sm" @click="singleUserStore.deactivateUser">Yes, deactivate</Button>
    </template>
  </interactive-toast>
</template>
