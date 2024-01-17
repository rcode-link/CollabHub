<script setup>

import UserIcon from "../../../shared/UserIcon.vue";

defineProps({
  user: {},
  showName: true
})
</script>

<template>
    <div
        :class="{
            'cursor-pointer flex gap-3 items-center': true,
            'w-fit': !showName,
            'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500': showName,
             'focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500': showName
        }"

    >
      <template v-if="!user">
        <UserIcon :avatar-size="showName ?'xs':'md'" :user="{avatar: ''}"/>
      </template>
      <template v-if="user">

        <UserIcon :avatar-size="showName ?'xs':'md'" :user="user"/>
        <span v-if="showName">
            {{ user.name }}
        </span>
      </template>
    </div>
</template>

<style scoped>

</style>
