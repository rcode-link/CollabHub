<script setup>
import Modal from '@/components/shared/Modal.vue'
import Button from '@/components/shared/Button.vue'
import Text from '@/components/shared/Text.vue'
import Label from '@/components/shared/Label.vue'
import CopyIcon from '@/components/shared/icons/CopyIcon.vue'
import { ref, watch } from 'vue'

const props = defineProps({
  chatableId: { type: Number, default: null },
})

const modal = ref(null)
const webhook = ref(null)
const loading = ref(false)
const copied = ref(false)
const saving = ref(false)

const loadWebhook = () => {
  if (!props.chatableId || !modal.value?.isShowModal) return
  loading.value = true
  axios.get(`/api/v1/webhooks/${props.chatableId}`).then(res => {
    webhook.value = res.data.data
  }).finally(() => {
    loading.value = false
  })
}

watch(() => modal.value?.isShowModal, () => {
  if (modal.value?.isShowModal) {
    loadWebhook()
  } else {
    webhook.value = null
    copied.value = false
  }
})

const copyUrl = () => {
  if (!webhook.value) return
  navigator.clipboard.writeText(webhook.value.url)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

const saveName = () => {
  if (!webhook.value) return
  saving.value = true
  axios.put(`/api/v1/webhooks/${webhook.value.id}`, {
    name: webhook.value.name,
  }).then(res => {
    webhook.value = res.data.data
  }).finally(() => {
    saving.value = false
  })
}

const toggleActive = () => {
  if (!webhook.value) return
  axios.put(`/api/v1/webhooks/${webhook.value.id}`, {
    is_active: !webhook.value.is_active,
  }).then(res => {
    webhook.value = res.data.data
  })
}

const regenerateToken = () => {
  if (!webhook.value) return
  if (!confirm('Are you sure? The old webhook URL will stop working.')) return
  axios.post(`/api/v1/webhooks/${webhook.value.id}/regenerate-token`).then(res => {
    webhook.value = res.data.data
  })
}

defineExpose({ modal })
</script>

<template>
  <Modal ref="modal">
    <template #header>Webhook Settings</template>
    <template #body>
      <div v-if="loading" class="flex items-center justify-center py-8">
        <svg class="animate-spin h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>

      <div v-else-if="webhook" class="flex flex-col gap-4">
        <!-- Name -->
        <div>
          <Label forInput="wh_name">Name</Label>
          <div class="flex items-center gap-2">
            <Text id="wh_name" v-model="webhook.name" class="flex-1" />
            <Button variant="primary" size="sm" @click="saveName" :disabled="saving">
              {{ saving ? 'Saving…' : 'Save' }}
            </Button>
          </div>
        </div>

        <!-- URL -->
        <div>
          <Label>Webhook URL</Label>
          <div class="flex items-center gap-2">
            <input
              :value="webhook.url"
              readonly
              class="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono"
            />
            <button
              @click="copyUrl"
              class="inline-flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              :title="copied ? 'Copied!' : 'Copy URL'"
            >
              <CopyIcon class="w-4 h-4" />
            </button>
          </div>
          <p v-if="copied" class="text-xs text-green-600 dark:text-green-400 mt-1">Copied to clipboard!</p>
        </div>

        <!-- Active toggle -->
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-700 dark:text-gray-300">Active</span>
          <button
            @click="toggleActive"
            :class="[
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              webhook.is_active ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
            ]"
          >
            <span
              :class="[
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                webhook.is_active ? 'translate-x-6' : 'translate-x-1'
              ]"
            />
          </button>
        </div>

        <!-- Regenerate token -->
        <div class="pt-2 border-t border-gray-100 dark:border-gray-800">
          <Button variant="danger" size="sm" @click="regenerateToken">
            Regenerate Token
          </Button>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            This will invalidate the current webhook URL.
          </p>
        </div>
      </div>
    </template>
    <template #footer>
      <Button @click="modal.toggleModal()">Close</Button>
    </template>
  </Modal>
</template>
