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

const emits = defineEmits(['update'])
const userState = useUserStore()
const router = useRouter()
const errorsStore = useErrorsStore()
const modal = ref(null)
const response = ref({})
const selected = ref([])
const title = ref('')
const searchUsers = ref('')

const initState = () => {
  response.value = {}
  selected.value = []
  title.value = ''
  searchUsers.value = ''
}

const save = () => {
  errorsStore.setErrors({})
  axios
    .post('/api/v1/chats', { user_id: selected.value, title: title.value })
    .then(res => {
      emits('update')
      modal.value.toggleModal()
      router.push({ name: 'chat-details', params: { chatId: res.data.data.id } })
    })
    .catch(error => {
      if (error.response.status === 422) {
        errorsStore.setErrors(error.response.data.errors, 'login')
      }
    })
}

const load = () => {
  if (userState.company.id && modal.value?.isShowModal) {
    axios.get(`/api/v1/company/users/${userState.company.id}`).then(res => {
      response.value = res.data
    })
  }
}

watch(() => modal.value?.isShowModal, () => {
  if (!modal.value?.isShowModal) initState()
  load()
})

const results = computed(() => {
  if (!response.value.data) return []
  const withoutMe = response.value.data.filter(obj => obj.id !== userState.user.id)
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
    <template #header>Create private or group chat</template>
    <template #body>
      <div class="flex flex-col gap-4">
        <div :class="selected.length < 2 ? 'opacity-50 cursor-not-allowed' : ''">
          <Label :forInput="'title'">Group chat title</Label>
          <Text
            id="title"
            :disabled="selected.length < 2"
            v-model="title"
            placeholder="Group chat title"
          />
          <Errors name="title" />
        </div>

        <hr class="border-gray-100 dark:border-gray-800" />

        <div>
          <Label :forInput="'searchUsers'">Search users</Label>
          <Text id="searchUsers" v-model="searchUsers" placeholder="Search users" />
        </div>

        <ul class="divide-y divide-gray-100 dark:divide-gray-800">
          <li
            v-for="obj in results"
            :key="obj.id + userState.onlineUsers"
            class="flex gap-3 items-center py-2"
          >
            <CheckBox
              :id="`user_${obj.id}`"
              :checked="selected.indexOf(obj.id) > -1"
              @update="selectionUpdated"
              :value="obj.id"
            />
            <label :for="`user_${obj.id}`" class="flex gap-2 items-center cursor-pointer">
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
      <Button variant="primary" @click="save">Create</Button>
    </template>
  </Modal>
</template>
