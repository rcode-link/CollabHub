<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const submit = () => {
  loading.value = true
  successMessage.value = ''
  errorMessage.value = ''

  window.axios
    .post('/api/v1/forgot-password', { email: email.value })
    .then(response => {
      successMessage.value = response.data.message || 'Password reset link sent. Check your inbox.'
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
    <div class="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 text-white">
      <div>
        <img src="@/assets/logo.svg" alt="CollabHub" class="h-10 brightness-0 invert" />
      </div>
      <div class="space-y-4">
        <h1 class="text-4xl font-bold leading-tight">Forgot your<br />password?</h1>
        <p class="text-blue-100 text-lg">
          No worries. Enter your email and we'll send you a link to reset it.
        </p>
      </div>
      <p class="text-blue-200 text-sm">© {{ new Date().getFullYear() }} CollabHub. All rights reserved.</p>
    </div>

    <!-- Right form panel -->
    <div class="flex-1 flex items-center justify-center px-6 py-12 bg-white dark:bg-gray-900">
      <div class="w-full max-w-md">
        <!-- Mobile logo -->
        <div class="lg:hidden mb-8 flex justify-center">
          <img src="@/assets/logo.svg" alt="CollabHub" class="h-10 dark:brightness-0 dark:invert" />
        </div>

        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Reset your password</h2>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Enter your email address and we'll send you a reset link.
          </p>
        </div>

        <!-- Success -->
        <div
          v-if="successMessage"
          class="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm"
        >
          {{ successMessage }}
        </div>

        <!-- Error -->
        <div
          v-if="errorMessage"
          class="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm"
        >
          {{ errorMessage }}
        </div>

        <form v-if="!successMessage" @submit.prevent="submit" class="space-y-5">
          <div>
            <label for="forgot-email" class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              Email address
            </label>
            <input
              id="forgot-email"
              v-model="email"
              type="email"
              autocomplete="email"
              required
              placeholder="you@example.com"
              class="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span v-if="loading">Sending…</span>
            <span v-else>Send reset link</span>
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Remembered it?
          <router-link :to="{ name: 'login' }" class="text-blue-600 dark:text-blue-400 font-medium hover:underline">
            Back to sign in
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>
