<script setup>
import Modal from '@/components/shared/Modal.vue'
import Button from '@/components/shared/Button.vue'
import { computed, ref, watch } from 'vue'
import UserIcon from '@/components/shared/UserIcon.vue'
import { useUserStore } from '@/store/user'
import { useRouter } from 'vue-router'
import CheckBox from '@/components/shared/CheckBox.vue'
import Text from '@/components/shared/Text.vue'
import Label from '@/components/shared/Label.vue'
import Errors from '@/components/shared/Errors.vue'
import { useErrorsStore } from '@/store/errors'
import CopyIcon from '@/components/shared/icons/CopyIcon.vue'

const emits = defineEmits(['update'])
const userState = useUserStore()
const router = useRouter()
const errorsStore = useErrorsStore()
const modal = ref(null)
const companyUsers = ref({})
const selected = ref([])
const name = ref('')
const searchUsers = ref('')
const webhookUrl = ref('')
const copied = ref(false)

const initState = () => {
  companyUsers.value = {}
  selected.value = []
  name.value = ''
  searchUsers.value = ''
  webhookUrl.value = ''
  copied.value = false
}

const save = () => {
  errorsStore.setErrors({})
  axios
    .post('/api/v1/webhooks', { name: name.value, user_id: selected.value })
    .then(res => {
      webhookUrl.value = res.data.data.url
      emits('update')
      const chatId = res.data.data.chat?.id
      if (chatId && !webhookUrl.value) {
        modal.value.toggleModal()
        router.push({ name: 'chat-details', params: { chatId } })
      }
    })
    .catch(error => {
      if (error.response?.status === 422) {
        errorsStore.setErrors(error.response.data.errors, 'login')
      }
    })
}

const goToChat = () => {
  modal.value.toggleModal()
  // reload the chat list to pick up the new webhook chat
  emits('update')
}

const copyUrl = () => {
  navigator.clipboard.writeText(webhookUrl.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

const load = () => {
  if (userState.company.id && modal.value?.isShowModal) {
    axios.get(`/api/v1/company/users/${userState.company.id}`).then(res => {
      companyUsers.value = res.data
    })
  }
}

watch(() => modal.value?.isShowModal, () => {
  if (!modal.value?.isShowModal) initState()
  load()
})

const results = computed(() => {
  if (!companyUsers.value.data) return []
  const withoutMe = companyUsers.value.data.filter(obj => obj.id !== userState.user.id)
  if (searchUsers.value.length >= 3) {
    return withoutMe.filter(obj => obj.name.toLowerCase().includes(searchUsers.value.toLowerCase()))
  }
  return withoutMe
})

function selectionUpdated(val) {
  if (val.checked) {
    selected.value.push(val.val)
  } else {
    selected.value.splice(selected.value.indexOf(val.val), 1)
  }
}

defineExpose({ modal })
</script>

<template>
  <Modal ref="modal">
    <template #header>Create Webhook</template>
    <template #body>
      <!-- After creation: show webhook URL -->
      <div v-if="webhookUrl" class="flex flex-col gap-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Webhook created! Use this URL to send messages to the chat:
        </p>
        <div class="flex items-center gap-2">
          <input
            :value="webhookUrl"
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
        <p v-if="copied" class="text-xs text-green-600 dark:text-green-400">Copied to clipboard!</p>
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Example:</p>
          <code class="text-xs text-gray-700 dark:text-gray-300 break-all">
            curl -X POST {{ webhookUrl }} -H 'Content-Type: application/json' -d '{"text": "Hello from webhook!"}'
          </code>
        </div>
      </div>

      <!-- Before creation: name + user selection -->
      <div v-else class="flex flex-col gap-4">
        <div>
          <Label forInput="webhook_name">Webhook name</Label>
          <Text
            id="webhook_name"
            v-model="name"
            placeholder="e.g. GitHub Notifications"
          />
          <Errors name="name" />
        </div>

        <hr class="border-gray-100 dark:border-gray-800" />

        <div>
          <Label forInput="searchWebhookUsers">Add users to receive messages</Label>
          <Text id="searchWebhookUsers" v-model="searchUsers" placeholder="Search users" />
        </div>

        <ul class="divide-y divide-gray-100 dark:divide-gray-800">
          <li
            v-for="obj in results"
            :key="obj.id"
            class="flex gap-3 items-center py-2"
          >
            <CheckBox
              :id="`webhook_user_${obj.id}`"
              :checked="selected.indexOf(obj.id) > -1"
              @update="selectionUpdated"
              :value="obj.id"
            />
            <label :for="`webhook_user_${obj.id}`" class="flex gap-2 items-center cursor-pointer">
              <UserIcon :status="false" :user="obj" />
              <div>
                <div class="text-sm font-medium text-gray-900 dark:text-white">{{ obj.name }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">{{ obj.email }}</div>
              </div>
            </label>
          </li>
        </ul>
      </div>
    </template>
    <template #footer>
      <Button v-if="webhookUrl" variant="primary" @click="goToChat">Done</Button>
      <Button v-else variant="primary" @click="save">Create Webhook</Button>
    </template>
  </Modal>
</template>
