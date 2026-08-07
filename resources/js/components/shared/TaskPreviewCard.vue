<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { DateTime } from 'luxon'
import UserIcon from '@/components/shared/UserIcon.vue'

const props = defineProps({
    taskKey: { type: String, required: true },
})

const router = useRouter()

const task = ref(null)
const loading = ref(true)
const failed = ref(false)

// Shared across every message on screen — the same task is often referenced
// many times in a conversation, and each render would otherwise refetch it.
const cache = new Map()

const fetchTask = (key) => {
    if (!cache.has(key)) {
        cache.set(
            key,
            window.axios
                .get(`/api/v1/tasks/${key}`)
                .then((res) => res.data.data)
                .catch(() => null)
        )
    }

    return cache.get(key)
}

const load = async () => {
    loading.value = true
    failed.value = false

    const key = props.taskKey
    const data = await fetchTask(key)

    // Guard against the prop changing while the request was in flight
    if (props.taskKey !== key) return

    task.value = data
    failed.value = data === null
    loading.value = false
}

onMounted(load)
watch(() => props.taskKey, load)

const open = () => router.push(`/open/${props.taskKey}`)
</script>

<template>
    <div
        v-if="loading || !failed"
        class="my-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
    >
        <!-- Loading skeleton -->
        <div v-if="loading" class="p-3 space-y-2">
            <div class="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div class="h-3 w-2/3 bg-gray-100 dark:bg-gray-700/60 rounded animate-pulse" />
        </div>

        <button
            v-else-if="task"
            type="button"
            class="w-full text-left p-3 hover:bg-blue-50/40 dark:hover:bg-gray-700/30 transition-colors"
            @click="open"
        >
            <div class="flex items-center gap-2 flex-wrap">
                <span
                    v-if="task.type?.title"
                    class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium"
                    :style="task.type.colour ? {
                        backgroundColor: task.type.colour + '1a',
                        color: task.type.colour,
                    } : {}"
                    :class="!task.type.colour && 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'"
                >
                    <span
                        v-if="task.type.colour"
                        class="w-2 h-2 rounded-full flex-shrink-0"
                        :style="{ backgroundColor: task.type.colour }"
                    />
                    {{ task.type.title }}
                </span>

                <span class="text-[11px] font-mono font-medium text-blue-600 dark:text-blue-400">
                    {{ task.task_id }}
                </span>

                <span v-if="task.status" class="flex items-center gap-1.5">
                    <span
                        class="w-2 h-2 rounded-full flex-shrink-0"
                        :style="{ backgroundColor: task.status.color || '#6B7280' }"
                    />
                    <span class="text-xs text-gray-600 dark:text-gray-400">{{ task.status.title }}</span>
                </span>

                <span v-if="task.due_date" class="text-[10px] text-gray-400 tabular-nums ml-auto">
                    {{ DateTime.fromISO(task.due_date).toLocaleString(DateTime.DATE_MED) }}
                </span>
            </div>

            <div class="mt-1.5 flex items-center gap-2 min-w-0">
                <UserIcon v-if="task.user" :user="task.user" :status="false" avatar-size="xs" />
                <span class="text-xs font-medium text-gray-900 dark:text-white truncate">
                    {{ task.name }}
                </span>
            </div>
        </button>
    </div>
</template>
