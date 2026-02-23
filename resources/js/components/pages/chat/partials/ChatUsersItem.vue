<script setup>
import { DateTime } from 'luxon'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import UserIcon from '@/components/shared/UserIcon.vue'
import Task from '@/components/shared/icons/Task.vue'
import EarthIcon from '@/components/shared/icons/EarthIcon.vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const route = useRoute()
const props = defineProps({ obj: {} })

const goToRoute = () => ({
  name: 'chat-details',
  query: route.query,
  params: { chatId: props.obj.id },
})

const daysAgo = computed(() => {
  if (!props.obj.message) return 0
  return DateTime.now()
    .startOf('day')
    .diff(DateTime.fromISO(props.obj.message.created_at).startOf('day'), ['hours', 'days']).days
})
</script>

<template>
  <router-link
    :to="goToRoute()"
    class="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors no-underline"
  >
    <!-- Avatar -->
    <div class="flex-shrink-0">
      <UserIcon v-if="['user', 'group'].includes(obj.type)" :user="obj" class="w-9 h-9" />
      <template v-else>
        <Task v-if="obj.type === 'app\\models\\task'" class="w-9 h-9" />
        <img
          v-else-if="obj.type === 'app\\models\\company' && userStore.company.avatar"
          :src="userStore.company.avatar"
          class="w-9 h-9 rounded-full object-cover"
        />
        <div
          v-else-if="obj.type === 'app\\models\\company'"
          class="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold"
        >{{ (obj.title || '?')[0].toUpperCase() }}</div>
        <EarthIcon v-if="obj.type === 'app\\models\\event'" class="w-9 h-9" />
      </template>
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between gap-2">
        <span class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ obj.title }}</span>
        <div
          v-if="obj.unreadMessages"
          class="flex-shrink-0 min-w-[1.25rem] h-5 px-1 bg-red-500 text-white flex items-center justify-center rounded-full text-xs font-bold"
        >{{ obj.unreadMessages }}</div>
      </div>

      <div v-if="obj.message" class="flex items-center justify-between gap-2 mt-0.5">
        <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
          {{ obj.message.user }}: {{ obj.message.text }}
        </p>
        <span class="flex-shrink-0 text-xs text-gray-400">
          <template v-if="daysAgo === 0">
            {{ DateTime.fromISO(obj.message.created_at).toLocaleString(DateTime.TIME_SIMPLE) }}
          </template>
          <template v-else-if="daysAgo === 1">1d ago</template>
          <template v-else>{{ daysAgo }}d ago</template>
        </span>
      </div>
    </div>
  </router-link>
</template>
