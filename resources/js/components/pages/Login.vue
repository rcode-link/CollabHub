<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useErrorsStore } from '@/store/errors'
import { useRouter } from 'vue-router'
import useInit from '@/functions/useInit.js'
import { Passkeys, UserCancelledError } from '@laravel/passkeys'

const router = useRouter()
const errorsStore = useErrorsStore()

const globalErrorMessage = ref('')
const loading = ref(false)
const passkeyLoading = ref(false)
const passkeysSupported = Passkeys.isSupported()

const form = reactive({
  email: '',
  password: '',
})

onMounted(() => {
  if (localStorage.getItem('token')) {
    router.push({ name: 'home' })
  }
})

const login = () => {
  errorsStore.setErrors({})
  globalErrorMessage.value = ''
  loading.value = true

  window.axios
    .post('/api/v1/login', form)
    .then(response => {
      localStorage.setItem('token', response.data.data.plainTextToken)
      useInit()
      router.push({ name: 'home' })
    })
    .catch(error => {
      if (error.response.status === 422) {
        errorsStore.setErrors(error.response.data.errors, 'login')
        return
      }
      globalErrorMessage.value = error.response.data.data
    })
    .finally(() => {
      loading.value = false
    })
}

const loginWithPasskey = async () => {
  errorsStore.setErrors({})
  globalErrorMessage.value = ''
  passkeyLoading.value = true

  try {
    const response = await Passkeys.verify({
      routes: { options: '/api/v1/passkeys/login/options', submit: '/api/v1/passkeys/login' },
    })
    localStorage.setItem('token', response.data.plainTextToken)
    useInit()
    router.push({ name: 'home' })
  } catch (error) {
    if (!(error instanceof UserCancelledError)) {
      globalErrorMessage.value = error.message
    }
  } finally {
    passkeyLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex">
    <!-- Left branding panel -->
    <div class="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 text-white">
      <div>
        <img src="@/assets/logo.svg" alt="CollabHub" class="h-10 brightness-0 invert" />
      </div>
      <div class="space-y-6">
        <h1 class="text-4xl font-bold leading-tight">
          Your team's<br />collaboration hub
        </h1>
        <p class="text-blue-100 text-lg">
          Everything your team needs — chat, projects, documents, and more — in one place.
        </p>
        <ul class="space-y-3 text-blue-50">
          <li class="flex items-center gap-3">
            <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            Real-time chat &amp; video calls
          </li>
          <li class="flex items-center gap-3">
            <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            Kanban &amp; Scrum project boards
          </li>
          <li class="flex items-center gap-3">
            <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            Collaborative document editing
          </li>
          <li class="flex items-center gap-3">
            <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            Invoicing &amp; reporting
          </li>
        </ul>
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
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Sign in to your account to continue</p>
        </div>

        <!-- Error alert -->
        <div
          v-if="globalErrorMessage"
          class="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm"
        >
          {{ globalErrorMessage }}
        </div>

        <form @submit.prevent="login" class="space-y-5">
          <div>
            <label for="email" class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              Email address
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              autocomplete="email"
              required
              placeholder="you@example.com"
              class="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label for="password" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <router-link
                :to="{ name: 'forgot-password' }"
                class="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Forgot password?
              </router-link>
            </div>
            <input
              id="password"
              v-model="form.password"
              type="password"
              autocomplete="current-password"
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
            <span v-if="loading">Signing in…</span>
            <span v-else>Sign in</span>
          </button>
        </form>

        <template v-if="passkeysSupported">
          <div class="my-5 flex items-center gap-3 text-xs text-gray-400">
            <span class="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
            or
            <span class="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
          </div>
          <button
            type="button"
            :disabled="passkeyLoading"
            @click="loginWithPasskey"
            class="w-full py-2.5 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span v-if="passkeyLoading">Waiting for passkey…</span>
            <span v-else>Sign in with a passkey</span>
          </button>
        </template>

        <p class="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Don't have an account?
          <router-link :to="{ name: 'register' }" class="text-blue-600 dark:text-blue-400 font-medium hover:underline">
            Create one
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>
