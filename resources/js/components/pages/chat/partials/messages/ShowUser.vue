<script setup>
import { FwbAvatar, FwbP } from 'flowbite-vue'
import { DateTime } from 'luxon'
import { computed } from 'vue'
import { chatDetails } from '@/store/chatStore.js'
import WebhookIcon from '@/components/shared/icons/WebhookIcon.vue'
import UserHoverCard from '@/components/shared/UserHoverCard.vue'

const props = defineProps({
  user: { type: Object, default: null },
  webhookMeta: { type: Object, default: null },
  messageId: null,
  messageDateTime: null,
})
const chatStore = chatDetails()

const isWebhook = computed(() => !props.user && !!props.webhookMeta)

const displayName = computed(() => {
  if (props.user) return props.user.name
  if (props.webhookMeta) return props.webhookMeta.username || props.webhookMeta.webhook_name || 'Webhook'
  return 'Unknown'
})

const showUser = computed(() => {
  const prevMessage = chatStore.messages.findIndex(obj => obj.id == props.messageId)
  if (prevMessage === 0) {
    return true
  }

  const prevMsg = chatStore.messages[prevMessage - 1]
  const currentUserId = props.user?.id ?? null
  const prevUserId = prevMsg?.user?.id ?? null

  // If both are webhook messages with no user, compare webhook names
  if (currentUserId === null && prevUserId === null) {
    const currentWebhookName = props.webhookMeta?.webhook_name
    const prevWebhookName = prevMsg?.webhook_meta?.webhook_name
    if (currentWebhookName === prevWebhookName) {
      const currentMessageDateTime = DateTime.fromISO(chatStore.messages[prevMessage].createdAt)
      const previusMessageDateTime = DateTime.fromISO(prevMsg.createdAt)
      const diff = currentMessageDateTime.diff(previusMessageDateTime, ['minute']).toObject()
      return diff.minutes > 1
    }
    return true
  }

  if (currentUserId !== prevUserId) {
    return true
  }

  const currentMessageDateTime = DateTime.fromISO(chatStore.messages[prevMessage].createdAt)
  const previusMessageDateTime = DateTime.fromISO(prevMsg.createdAt)
  const diff = currentMessageDateTime.diff(previusMessageDateTime, ['minute']).toObject()

  return diff.minutes > 1
})
</script>
<template>
  <!-- Webhook message sender -->
  <div
    v-if="showUser && isWebhook"
    class="mb-1 mt-2 ml-4 flex gap-1 items-center"
  >
    <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
      <WebhookIcon class="w-4 h-4" />
    </div>
    <div class="font-bold">
      <div class="text-sm text-gray-900 dark:text-white">
        {{ displayName }}
      </div>
      <div class="text-xs text-gray-600 mb-auto">
        {{ DateTime.fromISO(messageDateTime).toLocaleString(DateTime.DATETIME_SHORT) }}
      </div>
    </div>
  </div>

  <!-- Regular user sender -->
  <UserHoverCard v-else-if="showUser && user" :user="user" class="block">
    <router-link
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
  </UserHoverCard>
</template>
