<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { DateTime } from 'luxon'
import _ from 'lodash'

const emit = defineEmits(['close'])
const route = useRoute()

const query = ref('')
const results = ref([])
const loading = ref(false)
const inputRef = ref(null)

onMounted(() => nextTick(() => inputRef.value?.focus()))

function extractText(node) {
  if (!node) return ''
  if (node.type === 'text') return node.text || ''
  if (Array.isArray(node.content)) return node.content.map(extractText).join(' ')
  return ''
}

function parseMessage(message) {
  if (!message) return ''
  try {
    const json = typeof message === 'string' ? JSON.parse(message) : message
    return extractText(json).trim()
  } catch {
    return typeof message === 'string' ? message : ''
  }
}

const doSearch = _.debounce(async (q) => {
  if (!q || q.trim().length < 2) { results.value = []; loading.value = false; return }
  loading.value = true
  try {
    const res = await window.axios.get(
      `/api/v1/chats/${route.params.chatId}/messages/search`,
      { params: { q: q.trim() } }
    )
    results.value = Array.isArray(res.data.data) ? res.data.data : []
  } catch {
    results.value = []
  } finally {
    loading.value = false
  }
}, 350)

watch(query, (val) => doSearch(val))

const scrollToMessage = (id) => {
  const el = document.getElementById(`message-${id}`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('ring-2', 'ring-blue-400')
    setTimeout(() => el.classList.remove('ring-2', 'ring-blue-400'), 2000)
  }
  emit('close')
}
</script>

<template>
  <div class="absolute inset-0 z-40 flex flex-col bg-white dark:bg-gray-900">
    <!-- Search bar -->
    <div class="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
      <div class="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5">
        <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          ref="inputRef"
          v-model="query"
          type="search"
          placeholder="Search messages…"
          class="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
        />
      </div>
      <button
        @click="emit('close')"
        class="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="Close search"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Results -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="loading" class="flex justify-center py-10 text-sm text-gray-400">Searching…</div>

      <div v-else-if="query.length < 2" class="flex flex-col items-center justify-center py-10 gap-2 text-gray-400">
        <svg class="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <span class="text-sm">Type at least 2 characters to search</span>
      </div>

      <div v-else-if="results.length === 0" class="flex flex-col items-center justify-center py-10 text-gray-400">
        <span class="text-sm">No messages found for <strong>"{{ query }}"</strong></span>
      </div>

      <ul v-else class="divide-y divide-gray-100 dark:divide-gray-800">
        <li
          v-for="msg in results"
          :key="msg.id"
          @click="scrollToMessage(msg.id)"
          class="flex gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
        >
          <img
            v-if="msg.user?.avatar"
            :src="msg.user.avatar"
            class="w-9 h-9 rounded-full flex-shrink-0 object-cover"
          />
          <div
            v-else
            class="w-9 h-9 rounded-full flex-shrink-0 bg-blue-500 flex items-center justify-center text-white text-xs font-bold"
          >{{ msg.user?.name?.[0]?.toUpperCase() ?? '?' }}</div>
          <div class="flex-1 min-w-0">
            <div class="flex items-baseline gap-2">
              <span class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ msg.user?.name }}</span>
              <span class="text-xs text-gray-400 flex-shrink-0">{{ DateTime.fromISO(msg.createdAt).toRelative() }}</span>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">{{ parseMessage(msg.message) }}</p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
