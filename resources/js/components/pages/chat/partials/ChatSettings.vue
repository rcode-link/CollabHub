<script setup>
import Modal from '@/components/shared/Modal.vue'
import Button from '@/components/shared/Button.vue'
import Text from '@/components/shared/Text.vue'
import Label from '@/components/shared/Label.vue'
import UserIcon from '@/components/shared/UserIcon.vue'
import UserHoverCard from '@/components/shared/UserHoverCard.vue'
import CheckBox from '@/components/shared/CheckBox.vue'
import CopyIcon from '@/components/shared/icons/CopyIcon.vue'
import TrashIcon from '@/components/shared/icons/TrashIcon.vue'
import { useUserStore } from '@/store/user'
import { chatDetails } from '@/store/chatStore.js'
import { useRouter } from 'vue-router'
import { ref, computed, watch } from 'vue'

const props = defineProps({
  chat: { type: Object, required: true },
})
const emit = defineEmits(['updated', 'deleted'])

const userState = useUserStore()
const chatStore = chatDetails()
const router = useRouter()

const modal = ref(null)
const title = ref('')
const saving = ref(false)
const deleting = ref(false)
const confirmDelete = ref(false)

// Users management
const chatUsers = ref([])
const companyUsers = ref([])
const selected = ref([])
const searchUsers = ref('')
const loadingUsers = ref(false)

// Webhook specific
const webhook = ref(null)
const loadingWebhook = ref(false)
const copied = ref(false)

const isGroup = computed(() => props.chat.type === 'group')
const isWebhook = computed(() => props.chat.type === 'webhook' || props.chat.type === 'app\\models\\webhook')
const canManageUsers = computed(() => isGroup.value || isWebhook.value)
const canRename = computed(() => isGroup.value || isWebhook.value)

const loadData = () => {
  if (!modal.value?.isShowModal) return

  title.value = props.chat.title || ''
  confirmDelete.value = false

  if (canManageUsers.value) {
    loadingUsers.value = true
    Promise.all([
      axios.get(`/api/v1/chats/${props.chat.id}/users`),
      userState.company.id ? axios.get(`/api/v1/company/users/${userState.company.id}`) : Promise.resolve({ data: { data: [] } }),
    ]).then(([chatRes, companyRes]) => {
      chatUsers.value = chatRes.data.data
      companyUsers.value = companyRes.data.data || companyRes.data || []
      selected.value = chatUsers.value.map(u => u.id)
    }).finally(() => {
      loadingUsers.value = false
    })
  }

  if (isWebhook.value && props.chat.chatable_id) {
    loadingWebhook.value = true
    axios.get(`/api/v1/webhooks/${props.chat.chatable_id}`).then(res => {
      webhook.value = res.data.data
    }).finally(() => {
      loadingWebhook.value = false
    })
  }
}

const resetState = () => {
  title.value = ''
  chatUsers.value = []
  companyUsers.value = []
  selected.value = []
  searchUsers.value = ''
  webhook.value = null
  copied.value = false
  confirmDelete.value = false
}

watch(() => modal.value?.isShowModal, (open) => {
  if (open) loadData()
  else resetState()
})

const filteredCompanyUsers = computed(() => {
  let users = companyUsers.value.filter(u => u.id !== userState.user.id)
  if (searchUsers.value.length >= 2) {
    users = users.filter(u => u.name.toLowerCase().includes(searchUsers.value.toLowerCase()))
  }
  return users
})

function selectionUpdated(val) {
  if (val.checked) {
    selected.value.push(val.val)
  } else {
    selected.value = selected.value.filter(id => id !== val.val)
  }
}

const saveChanges = () => {
  saving.value = true
  const payload = {}

  if (canRename.value) {
    payload.title = title.value
  }
  if (canManageUsers.value) {
    payload.user_ids = selected.value
  }

  axios.put(`/api/v1/chats/${props.chat.id}`, payload).then(res => {
    chatStore.setActiveChat(res.data.data)
    emit('updated')

    if (isWebhook.value && webhook.value) {
      axios.put(`/api/v1/webhooks/${webhook.value.id}`, { name: title.value })
    }

    modal.value.toggleModal()
  }).finally(() => {
    saving.value = false
  })
}

const deleteChat = () => {
  if (!confirmDelete.value) {
    confirmDelete.value = true
    return
  }
  deleting.value = true
  axios.delete(`/api/v1/chats/${props.chat.id}`).then(() => {
    emit('deleted')
    modal.value.toggleModal()
    router.push({ name: 'chat' })
  }).finally(() => {
    deleting.value = false
  })
}

// Webhook-specific actions
const copyUrl = () => {
  if (!webhook.value) return
  navigator.clipboard.writeText(webhook.value.url)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
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
  <Modal ref="modal" size="lg">
    <template #header>Chat Settings</template>
    <template #body>
      <div class="flex flex-col gap-5">

        <!-- Rename -->
        <div v-if="canRename">
          <Label forInput="chat_title">Chat name</Label>
          <Text id="chat_title" v-model="title" placeholder="Chat name" />
        </div>

        <!-- Webhook URL & controls -->
        <template v-if="isWebhook && webhook">
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

          <div>
            <Button variant="soft" size="sm" @click="regenerateToken">
              Regenerate Token
            </Button>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              This will invalidate the current webhook URL.
            </p>
          </div>
        </template>

        <div v-if="isWebhook && loadingWebhook" class="flex items-center justify-center py-4">
          <svg class="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        </div>

        <!-- Manage users -->
        <div v-if="canManageUsers" class="border-t border-gray-100 dark:border-gray-800 pt-4">
          <Label forInput="searchChatUsers">Members</Label>
          <Text id="searchChatUsers" v-model="searchUsers" placeholder="Search users" class="mb-3" />

          <div v-if="loadingUsers" class="flex items-center justify-center py-4">
            <svg class="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
          </div>

          <ul v-else class="divide-y divide-gray-100 dark:divide-gray-800 max-h-60 overflow-y-auto">
            <li
              v-for="obj in filteredCompanyUsers"
              :key="obj.id"
              class="flex gap-3 items-center py-2"
            >
              <CheckBox
                :id="`chat_user_${obj.id}`"
                :checked="selected.includes(obj.id)"
                @update="selectionUpdated"
                :value="obj.id"
              />
              <label :for="`chat_user_${obj.id}`" class="cursor-pointer">
                <UserHoverCard :user="obj" class="flex gap-2 items-center">
                  <UserIcon :status="false" :user="obj" />
                  <div>
                    <div class="text-sm font-medium text-gray-900 dark:text-white">{{ obj.name }}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">{{ obj.email }}</div>
                  </div>
                </UserHoverCard>
              </label>
            </li>
          </ul>
        </div>

        <!-- Delete chat -->
        <div class="border-t border-gray-100 dark:border-gray-800 pt-4">
          <div class="flex items-center gap-3">
            <Button variant="danger" size="sm" @click="deleteChat" :disabled="deleting">
              <TrashIcon class="w-3.5 h-3.5" />
              {{ confirmDelete ? 'Confirm delete' : 'Delete chat' }}
            </Button>
            <span v-if="confirmDelete" class="text-xs text-red-500">
              Click again to confirm. This cannot be undone.
            </span>
          </div>
        </div>

      </div>
    </template>
    <template #footer>
      <Button variant="ghost" @click="modal.toggleModal()">Cancel</Button>
      <Button variant="primary" @click="saveChanges" :disabled="saving">
        {{ saving ? 'Saving…' : 'Save' }}
      </Button>
    </template>
  </Modal>
</template>
