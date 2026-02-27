<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SquaresIcon from '@/components/shared/icons/SquaresIcon.vue'
import ChatIcon from '@/components/shared/icons/ChatIcon.vue'
import UsersIcon from '@/components/shared/icons/UsersIcon.vue'
import ArrowDownTray from '@/components/shared/icons/ArrowDownTray.vue'
import WebhookIcon from '@/components/shared/icons/WebhookIcon.vue'

const router = useRouter()
const route = useRoute()

const changeChatFilter = (type) => {
  router.push({ query: { ...route.query, type } })
}

const activeTab = computed(() => {
  return ['user', 'group', 'system', 'webhook'].includes(route.query.type) ? route.query.type : 'all'
})

const tabs = [
  { key: 'all',    icon: SquaresIcon,   filter: 'none' },
  { key: 'user',   icon: ChatIcon,      filter: 'user' },
  { key: 'group',  icon: UsersIcon,     filter: 'group' },
  { key: 'system', icon: ArrowDownTray, filter: 'system' },
  { key: 'webhook', icon: WebhookIcon, filter: 'webhook' },
]
</script>

<template>
  <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl sticky top-0 z-10 flex items-center gap-1 px-2 py-2">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      @click="changeChatFilter(tab.filter)"
      :class="[
        'inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors',
        activeTab === tab.key
          ? 'bg-blue-600 text-white'
          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
      ]"
    >
      <component :is="tab.icon" class="w-4 h-4" />
    </button>
    <span class="ml-auto">
      <slot />
    </span>
  </div>
</template>
