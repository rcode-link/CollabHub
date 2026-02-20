<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const form = reactive({
  token: route.query.token || '',
  email: route.query.email || '',
  password: '',
  password_confirmation: '',
})

const passwordChecks = computed(() => ({
  length: form.password?.length >= 8,
  uppercase: /[A-Z]/.test(form.password),
  number: /[0-9]/.test(form.password),
  special: /[@$!%*#?_&]/.test(form.password),
}))

const submit = () => {
  loading.value = true
  errorMessage.value = ''

  window.axios
    .post('/api/v1/reset-password', form)
    .then(response => {
      successMessage.value = response.data.message || 'Password reset successfully.'
      setTimeout(() => router.push({ name: 'login' }), 2000)
    })
    .catch(error => {
      errorMessage.value = error.response?.data?.message || 'Something went wrong. Please try again.'
    })
    .finally(() => {
      loading.value = false
    })
}
</script>

<template>
  <div class="min-h-screen flex">
    <!-- Left branding panel -->
    <div class="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-orange-400 via-orange-500 to-blue-500 text-white">
      <div>
        <img src="@/assets/logo.svg" alt="CollabHub" class="h-10 brightness-0 invert" />
      </div>
      <div class="space-y-4">
        <h1 class="text-4xl font-bold leading-tight">Set a new<br />password</h1>
        <p class="text-orange-100 text-lg">
          Choose a strong password to keep your account secure.
        </p>
      </div>
      <p class="text-orange-200 text-sm">© {{ new Date().getFullYear() }} CollabHub. All rights reserved.</p>
    </div>

    <!-- Right form panel -->
    <div class="flex-1 flex items-center justify-center px-6 py-12 bg-white dark:bg-gray-900">
      <div class="w-full max-w-md">
        <!-- Mobile logo -->
        <div class="lg:hidden mb-8 flex justify-center">
          <img src="@/assets/logo.svg" alt="CollabHub" class="h-10 dark:brightness-0 dark:invert" />
        </div>

        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Create new password</h2>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Your new password must be different from previously used passwords.
          </p>
        </div>

        <!-- Success -->
        <div
          v-if="successMessage"
          class="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm"
        >
          {{ successMessage }} Redirecting to sign in…
        </div>

        <!-- Error -->
        <div
          v-if="errorMessage"
          class="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm"
        >
          {{ errorMessage }}
        </div>

        <form v-if="!successMessage" @submit.prevent="submit" class="space-y-5">
          <!-- Pre-filled email (read-only) -->
          <div>
            <label for="reset-email" class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              Email address
            </label>
            <input
              id="reset-email"
              v-model="form.email"
              type="email"
              readonly
              class="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label for="reset-password" class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              New password
            </label>
            <input
              id="reset-password"
              v-model="form.password"
              type="password"
              autocomplete="new-password"
              required
              placeholder="••••••••"
              class="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <div class="mt-2.5 grid grid-cols-2 gap-1.5">
              <div
                v-for="check in [
                  { label: '8+ characters', key: 'length' },
                  { label: 'Uppercase letter', key: 'uppercase' },
                  { label: 'Number', key: 'number' },
                  { label: 'Special character', key: 'special' },
                ]"
                :key="check.key"
                class="flex items-center gap-1.5 text-xs"
                :class="passwordChecks[check.key] ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'"
              >
                <svg v-if="passwordChecks[check.key]" class="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <svg v-else class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke-width="2" />
                </svg>
                {{ check.label }}
              </div>
            </div>
          </div>

          <div>
            <label for="reset-confirm" class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm new password
            </label>
            <input
              id="reset-confirm"
              v-model="form.password_confirmation"
              type="password"
              autocomplete="new-password"
              required
              placeholder="••••••••"
              class="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span v-if="loading">Resetting…</span>
            <span v-else>Reset password</span>
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <router-link :to="{ name: 'login' }" class="text-blue-600 dark:text-blue-400 font-medium hover:underline">
            Back to sign in
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>
