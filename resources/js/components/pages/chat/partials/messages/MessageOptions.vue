<script setup>
import { FwbButton } from 'flowbite-vue'
import InteractiveToast from '@/components/shared/InteractiveToast.vue'
import { chatDetails } from '@/store/chatStore.js'
import { ref, computed } from 'vue'
import { Tippy } from 'vue-tippy'
import Emoji from '@/components/shared/Emoji.vue'
import ArrowBackIcon from '@/components/shared/icons/ArrowBackIcon.vue'
import TrashIcon from '@/components/shared/icons/TrashIcon.vue'

const STORAGE_KEY = 'collabhub:recent-emojis'
const MAX_RECENT = 5
const DEFAULT_EMOJIS = ['👍', '❤️', '😂', '🎉', '👀']

const messagesState = chatDetails()
const deleteMessageToast = ref(null)

const message = computed(() =>
  messagesState.messages.find(obj => obj.id == messagesState.selectedMessage)
)

// Recent emojis from localStorage
const recentEmojis = ref(loadRecent())

function loadRecent() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (Array.isArray(stored) && stored.length > 0) return stored.slice(0, MAX_RECENT)
  } catch {}
  return DEFAULT_EMOJIS
}

function saveRecent(emoji) {
  const list = [emoji, ...recentEmojis.value.filter(e => e !== emoji)].slice(0, MAX_RECENT)
  recentEmojis.value = list
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

// Quick emoji reaction (from recent row)
function quickReact(emoji) {
  saveRecent(emoji)
  axios.post('/api/v1/messages/reactions', {
    reaction: emoji,
    chat_message_id: message.value.id,
  })
}

// Full picker reaction
function messageReaction(emoji) {
  deleteMessageToast.value.hideToast()
  saveRecent(emoji.i)
  axios.post('/api/v1/messages/reactions', {
    reaction: emoji.i,
    chat_message_id: message.value.id,
  })
}

function deleteMessage() {
  axios.delete(`/api/v1/messages/${message.value.id}`)
}
</script>

<template>
  <Teleport :to="`#message-${message.id}`">
    <div class="options-bar">
      <!-- Recent emoji quick buttons -->
      <button
        v-for="emoji in recentEmojis"
        :key="emoji"
        class="emoji-btn"
        @click.stop="quickReact(emoji)"
      >
        {{ emoji }}
      </button>

      <!-- Divider -->
      <div class="divider" />

      <!-- Full emoji picker -->
      <tippy content="More emoji" placement="top">
        <Emoji @select="messageReaction" class="action-btn" />
      </tippy>

      <!-- Reply -->
      <tippy content="Reply" placement="top">
        <button
          class="action-btn"
          @click="messagesState.setReplyToMessageId(message.id)"
        >
          <ArrowBackIcon class="w-3.5 h-3.5" />
        </button>
      </tippy>

      <!-- Delete -->
      <tippy content="Delete" placement="top">
        <button
          class="action-btn action-btn-danger"
          @click="deleteMessageToast.showToastFn()"
        >
          <TrashIcon class="w-3.5 h-3.5" />
        </button>
      </tippy>
    </div>
  </Teleport>

  <InteractiveToast ref="deleteMessageToast">
    <template #content>
      Are you sure you want to delete this message?
    </template>
    <template #actions>
      <fwb-button size="xs" @click="deleteMessage">
        Yes, Delete it!
      </fwb-button>
    </template>
  </InteractiveToast>
</template>

<style scoped>
.options-bar {
  @apply absolute -top-4 right-2 z-50
         flex items-center gap-0.5
         px-1 py-0.5
         bg-white dark:bg-gray-800
         border border-gray-200 dark:border-gray-700
         rounded-lg shadow-md;
}

.emoji-btn {
  @apply w-7 h-7 flex items-center justify-center
         text-sm leading-none
         rounded-md
         hover:bg-gray-100 dark:hover:bg-gray-700
         transition-colors cursor-pointer
         select-none;
}

.emoji-btn:active {
  @apply scale-125;
  transition: transform 0.1s;
}

.divider {
  @apply w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5;
}

.action-btn {
  @apply w-7 h-7 flex items-center justify-center
         rounded-md
         text-gray-500 dark:text-gray-400
         hover:bg-gray-100 dark:hover:bg-gray-700
         hover:text-gray-700 dark:hover:text-gray-200
         transition-colors cursor-pointer;
}

.action-btn-danger:hover {
  @apply text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30;
}
</style>
