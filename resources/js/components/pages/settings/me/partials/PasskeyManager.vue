<script setup>
import Label from '@/components/shared/Label.vue'
import Text from '@/components/shared/Text.vue'
import Button from '@/components/shared/Button.vue'
import { onMounted, ref } from 'vue'
import { toast } from 'vue3-toastify'
import { Passkeys, PasskeyExistsError, UserCancelledError } from '@laravel/passkeys'

const isSupported = Passkeys.isSupported()
const passkeyName = ref('')
const passkeys = ref([])
const registering = ref(false)
const error = ref('')

const toastTheme = () => localStorage.getItem('color-theme') ?? 'light'

const fetchPasskeys = () => {
  window.axios.get('/api/v1/user/passkeys').then(response => {
    passkeys.value = response.data.data
  })
}

const registerPasskey = async () => {
  error.value = ''
  registering.value = true

  Passkeys.configure({
    fetch: { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
  })

  try {
    await Passkeys.register({
      name: passkeyName.value,
      routes: { options: '/api/v1/user/passkeys/options', submit: '/api/v1/user/passkeys' },
    })
    passkeyName.value = ''
    toast.success('Passkey added', { theme: toastTheme() })
    fetchPasskeys()
  } catch (e) {
    if (e instanceof UserCancelledError) {
      return
    }
    error.value = e instanceof PasskeyExistsError
      ? 'This device already has a passkey for your account.'
      : e.message
  } finally {
    registering.value = false
  }
}

const deletePasskey = passkey => {
  if (!confirm(`Remove passkey "${passkey.name}"? You will no longer be able to sign in with it.`)) return

  window.axios.delete(`/api/v1/user/passkeys/${passkey.id}`).then(() => {
    passkeys.value = passkeys.value.filter(item => item.id !== passkey.id)
    toast.success('Passkey removed', { theme: toastTheme() })
  })
}

const formatDate = value => (value ? new Date(value).toLocaleDateString() : 'Never')

onMounted(fetchPasskeys)
</script>

<template>
  <div class="grid gap-5">
    <p class="text-sm text-gray-500 dark:text-gray-400">
      Sign in with your fingerprint, face, screen lock or a security key instead of a password.
    </p>

    <ul v-if="passkeys.length" class="divide-y divide-gray-200 dark:divide-gray-700 rounded-lg border border-gray-200 dark:border-gray-700">
      <li v-for="passkey in passkeys" :key="passkey.id" class="flex items-center justify-between gap-4 px-4 py-3">
        <div class="min-w-0">
          <p class="truncate text-sm font-medium text-gray-900 dark:text-white">{{ passkey.name }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            <span v-if="passkey.authenticator">{{ passkey.authenticator }} · </span>
            Added {{ formatDate(passkey.created_at) }} · Last used {{ formatDate(passkey.last_used_at) }}
          </p>
        </div>
        <Button variant="ghost" size="sm" @click="deletePasskey(passkey)">Remove</Button>
      </li>
    </ul>
    <p v-else class="text-sm text-gray-500 dark:text-gray-400">You haven't added any passkeys yet.</p>

    <p v-if="!isSupported" class="text-sm text-amber-600 dark:text-amber-400">
      This browser doesn't support passkeys.
    </p>
    <form v-else @submit.prevent="registerPasskey" class="grid gap-2">
      <Label forInput="passkey_name">Passkey name</Label>
      <div class="flex flex-col sm:flex-row gap-2">
        <div class="flex-1">
          <Text v-model="passkeyName" name="passkey_name" placeholder="e.g. Work laptop" />
        </div>
        <Button type="submit" size="sm" :disabled="registering || !passkeyName">
          {{ registering ? 'Waiting for device…' : 'Add passkey' }}
        </Button>
      </div>
      <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
    </form>
  </div>
</template>
