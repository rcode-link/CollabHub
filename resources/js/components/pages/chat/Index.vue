<script setup>
import Auth from '../../layouts/Auth.vue'
import { useBreadcrumbStore } from '../../../store/breadcrumb'
import Card from '../../shared/Card.vue'
import { ref, watch } from 'vue'
import Users from './partials/LeftChatManu.vue'
import MenuIcon from '../../shared/icons/MenuIcon.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const showListInMobile = ref(false)
const breadcrumb = useBreadcrumbStore()
breadcrumb.setLinks([
  { link: '/', title: 'Home' },
  { title: 'Chat' },
])

watch(
  () => route.params.chatId,
  () => {
    showListInMobile.value = !route.params.chatId
  },
  { immediate: true },
)
</script>

<template>
  <Auth>
    <div class="grid lg:grid-cols-3 grid-cols-1 gap-2 h-[calc(100vh-86px)] relative">
      <!-- Mobile toggle -->
      <button
        class="ml-auto lg:hidden h-8 w-8 inline-flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        @click="showListInMobile = !showListInMobile"
      >
        <MenuIcon class="w-4 h-4" />
      </button>

      <!-- Chat list panel -->
      <div
        :class="[
          'absolute lg:relative top-[45px] lg:top-0 bottom-0 overflow-auto z-20 bg-white dark:bg-gray-900 lg:bg-transparent w-full lg:w-auto transition-all lg:translate-x-0 lg:overflow-auto',
          showListInMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        ]"
      >
        <Users />
      </div>

      <!-- Conversation panel -->
      <Card class="flex-col col-span-3 lg:col-span-2 gap-6 relative">
        <router-view />
      </Card>
    </div>
  </Auth>
</template>
