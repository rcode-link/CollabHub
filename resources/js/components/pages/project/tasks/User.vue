<script setup>

import UserIcon from "@/components/shared/UserIcon.vue";

defineProps({
  user: {},
  showName: true
})
</script>

<template>
    <div
        :class="[
            'flex items-center gap-2',
            showName
                ? 'rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white px-2.5 py-1.5'
                : 'w-fit cursor-pointer'
        ]"
    >
      <template v-if="!user">
        <UserIcon :avatar-size="showName ? 'xs' : 'md'" :user="{ avatar: '' }" :status="false" />
      </template>
      <template v-if="user">
        <UserIcon :avatar-size="showName ? 'xs' : 'md'" :user="user" />
        <span v-if="showName" class="truncate">{{ user.name }}</span>
      </template>
    </div>
</template>

<style scoped>

</style>
