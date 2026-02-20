<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { DateTime } from 'luxon'
import { chatDetails } from '@/store/chatStore.js'
import _ from 'lodash'

const emit = defineEmits(['close'])
const route = useRoute()
const chatStore = chatDetails()

const query = ref('')
const results = ref([])
const loading = ref(false)

// Extract plain text from TipTap JSON
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
        return ''
    }
}

const doSearch = _.debounce(async (q) => {
    if (q.trim().length < 2) {
        results.value = []
        return
    }
    loading.value = true
    try {
        const res = await window.axios.get(
            `/api/v1/chats/${route.params.chatId}/messages/search`,
            { params: { q } }
        )
        results.value = res.data.data
    } finally {
        loading.value = false
    }
}, 300)

watch(query, (val) => doSearch(val))

const scrollToMessage = (id) => {
    // If message is already in the loaded list, scroll to it
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
    <div class="absolute inset-0 z-30 bg-white dark:bg-gray-800 flex flex-col">
        <!-- Search input bar -->
        <div class="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
                v-model="query"
                autofocus
                type="text"
                placeholder="Search messages…"
                class="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
            />
            <button
                @click="emit('close')"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <!-- Results -->
        <div class="flex-1 overflow-y-auto">
            <!-- Loading -->
            <div v-if="loading" class="flex justify-center items-center py-8 text-sm text-gray-400">
                Searching…
            </div>

            <!-- Empty state -->
            <div v-else-if="query.length >= 2 && results.length === 0"
                class="flex justify-center items-center py-8 text-sm text-gray-400">
                No messages found for "{{ query }}"
            </div>

            <!-- Hint -->
            <div v-else-if="query.length < 2"
                class="flex justify-center items-center py-8 text-sm text-gray-400">
                Type at least 2 characters to search
            </div>

            <!-- Result list -->
            <ul v-else class="divide-y divide-gray-100 dark:divide-gray-700">
                <li
                    v-for="msg in results"
                    :key="msg.id"
                    @click="scrollToMessage(msg.id)"
                    class="flex gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                    <img
                        v-if="msg.user?.avatar"
                        :src="msg.user.avatar"
                        class="w-8 h-8 rounded-full flex-shrink-0 object-cover"
                    />
                    <div v-else
                        class="w-8 h-8 rounded-full flex-shrink-0 bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                        {{ msg.user?.name?.[0]?.toUpperCase() }}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-baseline gap-2">
                            <span class="text-sm font-medium text-gray-900 dark:text-white">
                                {{ msg.user?.name }}
                            </span>
                            <span class="text-xs text-gray-400 flex-shrink-0">
                                {{ DateTime.fromISO(msg.createdAt).toRelative() }}
                            </span>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300 truncate mt-0.5">
                            {{ parseMessage(msg.message) }}
                        </p>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>
