<script setup>
import { ref, computed, nextTick, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { FwbAvatar } from 'flowbite-vue'
import { useUserStore } from '@/store/user'

defineOptions({ inheritAttrs: false })

const props = defineProps({
    // Wrapper mode: the user shown for the slotted trigger
    user: { type: Object, default: null },
    // Delegation mode: watch this element for hover on `.mention[data-id]` spans (v-html content)
    container: { type: Object, default: null },
})

const router = useRouter()
const userStore = useUserStore()

const trigger = ref(null)
const card = ref(null)
const visible = ref(false)
const busy = ref(false)
const cardStyle = ref({})

// In delegation mode the hovered mention decides the user; in wrapper mode it's the prop
const delegatedUser = ref(null)
const delegatedAnchor = ref(null)
const displayUser = computed(() => delegatedUser.value ?? props.user)
const isSelf = computed(() => Number(displayUser.value?.id) === Number(userStore.user?.id))

// Cache of fetched user details (avatar/email) per user id
const userCache = new Map()
const enrich = (id) => {
    if (userCache.has(id)) {
        delegatedUser.value = { ...delegatedUser.value, ...userCache.get(id) }
        return
    }
    window.axios.get(`/api/v1/users/${id}`).then((res) => {
        const data = res.data.data ?? res.data
        userCache.set(id, data)
        if (Number(delegatedUser.value?.id) === Number(id)) {
            delegatedUser.value = { ...delegatedUser.value, ...data }
        }
    }).catch(() => {})
}

let showTimer = null
let hideTimer = null

const position = async () => {
    await nextTick()
    const anchor = delegatedAnchor.value ?? trigger.value?.firstElementChild ?? trigger.value
    const t = anchor?.getBoundingClientRect()
    const c = card.value?.getBoundingClientRect()
    if (!t || !c) return
    const left = Math.min(Math.max(8, t.left), window.innerWidth - c.width - 8)
    let top = t.bottom + 6
    if (top + c.height > window.innerHeight - 8) {
        top = Math.max(8, t.top - c.height - 6)
    }
    cardStyle.value = { left: `${left}px`, top: `${top}px` }
}

const scheduleShow = () => {
    clearTimeout(hideTimer)
    clearTimeout(showTimer)
    showTimer = setTimeout(() => {
        visible.value = true
        position()
    }, 350)
}

const onEnter = () => {
    delegatedUser.value = null
    delegatedAnchor.value = null
    scheduleShow()
}

const onLeave = () => {
    clearTimeout(showTimer)
    hideTimer = setTimeout(() => {
        visible.value = false
    }, 200)
}

const cancelHide = () => clearTimeout(hideTimer)

// ── Delegation mode: hover on rendered @mentions ──────────────
const findMention = (e) => e.target?.closest?.('.mention[data-id]')

const onContainerOver = (e) => {
    const el = findMention(e)
    if (!el) return
    const id = Number(el.dataset.id)
    if (!id) return
    delegatedAnchor.value = el
    delegatedUser.value = {
        id,
        name: el.dataset.label ?? el.textContent.replace(/^@/, ''),
    }
    enrich(id)
    scheduleShow()
}

const onContainerOut = (e) => {
    if (!findMention(e)) return
    onLeave()
}

watch(
    () => props.container,
    (el, prev) => {
        if (prev) {
            prev.removeEventListener('mouseover', onContainerOver)
            prev.removeEventListener('mouseout', onContainerOut)
        }
        if (el) {
            el.addEventListener('mouseover', onContainerOver)
            el.addEventListener('mouseout', onContainerOut)
        }
    },
    { immediate: true },
)

onBeforeUnmount(() => {
    clearTimeout(showTimer)
    clearTimeout(hideTimer)
    if (props.container) {
        props.container.removeEventListener('mouseover', onContainerOver)
        props.container.removeEventListener('mouseout', onContainerOut)
    }
})

// ── Actions ───────────────────────────────────────────────────
// Direct messages are untitled 1-on-1 chats; the backend returns the existing one if it already exists
const openDm = () =>
    window.axios
        .post('/api/v1/chats', { user_id: [displayUser.value.id], title: '' })
        .then(res => res.data.data.id)

const sendMessage = async () => {
    if (busy.value) return
    busy.value = true
    try {
        const chatId = await openDm()
        visible.value = false
        router.push({ name: 'chat-details', params: { chatId } })
    } finally {
        busy.value = false
    }
}

const startCall = async () => {
    if (busy.value) return
    busy.value = true
    try {
        const chatId = await openDm()
        const res = await window.axios.post(`/api/v1/video-call/${chatId}/start`)
        visible.value = false
        router.push({ name: 'chat-details', params: { chatId }, query: { callId: res.data.slug } })
    } finally {
        busy.value = false
    }
}

const viewProfile = () => {
    visible.value = false
    router.push({ name: 'user.details', params: { id: displayUser.value.id } })
}
</script>

<template>
    <span v-if="!container" ref="trigger" v-bind="$attrs" @mouseenter="onEnter" @mouseleave="onLeave">
        <slot />
    </span>

    <Teleport to="body">
        <div
            v-if="visible && displayUser"
            ref="card"
            :style="cardStyle"
            @mouseenter="cancelHide"
            @mouseleave="onLeave"
            class="fixed z-[120] w-64 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl overflow-hidden"
        >
            <div class="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <fwb-avatar :img="displayUser.avatar" size="md" />
                <div class="min-w-0">
                    <div class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ displayUser.name }}</div>
                    <div v-if="displayUser.email" class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ displayUser.email }}</div>
                </div>
            </div>

            <div class="p-2 flex gap-1">
                <button
                    v-if="!isSelf"
                    type="button"
                    :disabled="busy"
                    @click="sendMessage"
                    class="flex-1 flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                >
                    <svg class="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Message
                </button>
                <button
                    v-if="!isSelf"
                    type="button"
                    :disabled="busy"
                    @click="startCall"
                    class="flex-1 flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                >
                    <svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Call
                </button>
                <button
                    type="button"
                    @click="viewProfile"
                    class="flex-1 flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                </button>
            </div>
        </div>
    </Teleport>
</template>
