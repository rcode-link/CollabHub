<script setup>
import Auth from '@/components/layouts/Auth.vue'
import { useBreadcrumbStore } from '@/store/breadcrumb'
import Card from '@/components/shared/Card.vue'
import { ref, watch } from 'vue'
import Users from '@/components/pages/chat/partials/LeftChatManu.vue'
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
