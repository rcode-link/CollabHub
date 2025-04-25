<script setup>
import { FwbAvatar, FwbP } from 'flowbite-vue'
import { DateTime } from 'luxon'
import { computed } from 'vue'
import { chatDetails } from '@/store/chatStore.js'
const { user, messageId } = defineProps({
  user: null,
  messageId: null,
  messageDateTime: null,
})
const chatStore = chatDetails()

const showUser = computed(() => {
  const prevMessage = chatStore.messages.findIndex(obj => obj.id == messageId)
  // if the message index is zero that means its first message in the list
  if (prevMessage === 0) {
    return true
  }

  const isSameUser = user.id === chatStore.messages[prevMessage - 1].user.id

  if (!isSameUser) {
    return true
  }

  const currentMessageDateTime = DateTime.fromISO(
    chatStore.messages[prevMessage].createdAt,
  )
  const previusMessageDateTime = DateTime.fromISO(
    chatStore.messages[prevMessage - 1].createdAt,
  )
  const diff = currentMessageDateTime
    .diff(previusMessageDateTime, ['minute'])
    .toObject()

  return diff.minutes > 1
})
</script>
<template>
  <router-link
    v-if="showUser"
    :to="`/user/${user.id}`"
    :class="{ 'mb-1 mt-2 ml-4 flex gap-1 items-center': true }"
  >
    <fwb-avatar :img="user.avatar" />
    <fwb-p class="font-bold">
      <div>
        {{ user.name }}
      </div>
      <div class="text-xs text-gray-600 mb-auto">
        {{
          DateTime.fromISO(messageDateTime).toLocaleString(
            DateTime.DATETIME_SHORT,
          )
        }}
      </div>
    </fwb-p>
  </router-link>
</template>
