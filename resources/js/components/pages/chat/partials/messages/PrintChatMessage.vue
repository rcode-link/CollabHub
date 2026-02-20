<script setup>
import RenderMessage from '@/components/shared/RenderMessage.vue'
import PrintFiles from '@/components/shared/PrintFiles.vue'
import { computed } from 'vue'
import _ from 'lodash'
import ArrowUpCurvedIcon from '@/components/shared/icons/ArrowUpCurvedIcon.vue'
import PhoneIcon from '@/components/shared/icons/PhoneIcon.vue'

const props = defineProps({ message: {} })
const reactions = computed(() => _.groupBy(props.message.reactions, 'reaction'))
</script>

<template>
  <div
    :class="[
      'flex rounded cursor-pointer mb-0.5 ml-10 message-container',
      message.videocall === null && 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
    ]"
    :id="`message-${message.id}`"
  >
    <div class="flex-1 p-1">
      <!-- Reply-to -->
      <div v-if="message.parent" class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
        <RenderMessage class="reply-editor-class opacity-60" :content="message.parent.text" />
        <ArrowUpCurvedIcon class="w-3.5 h-3.5 text-gray-400" />
      </div>

      <!-- Message body -->
      <RenderMessage :class="{ 'ml-4 -mt-4': message.parent }" :content="message.message" />

      <!-- Files -->
      <div v-if="message.media.length" class="flex gap-4 flex-wrap mt-1">
        <PrintFiles :media="message.media" />
      </div>

      <!-- Video call badge -->
      <router-link
        v-if="message.videocall && message.videocall.slug"
        :to="{ query: { callId: message.videocall.slug } }"
        class="inline-flex items-center gap-1.5 mt-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-xs font-medium no-underline"
      >
        <PhoneIcon class="w-3.5 h-3.5" />
        Join Call
      </router-link>

      <!-- Reactions -->
      <div v-if="Object.keys(reactions).length" class="flex flex-wrap gap-1 mt-1">
        <span
          v-for="key in Object.keys(reactions)"
          :key="key"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 cursor-default"
        >
          {{ key }} <span class="font-medium">{{ reactions[key].length }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reply-editor-class {
  width: calc(100% - 4rem);
  margin-bottom: 0.5rem;
}
</style>
