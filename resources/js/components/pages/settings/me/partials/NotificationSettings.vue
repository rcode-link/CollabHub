<script setup>
import Card from '@/components/shared/Card.vue'
import { useNotificationSettings } from '@/functions/useNotificationSettings.js'

const {
  platform,
  settings,
  isNativeApp,
  canNotify,
  needsBrowserPermission,
  browserPermission,
  enable,
  disable,
  toggle,
} = useNotificationSettings()

const platformLabel = {
  electron: 'Desktop App',
  capacitor: 'Mobile App',
  browser: 'Browser',
}

async function handleEnable() {
  await enable()
}
</script>

<template>
  <Card>
    <div class="p-6">
      <div class="flex items-center justify-between mb-1">
        <h2 class="text-base font-semibold text-gray-900 dark:text-white">Notifications</h2>
        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
          <span class="w-1.5 h-1.5 rounded-full" :class="canNotify ? 'bg-green-500' : 'bg-gray-400'"></span>
          {{ platformLabel[platform] }}
        </span>
      </div>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-5">
        <template v-if="isNativeApp">
          Receive native notifications for messages and calls.
        </template>
        <template v-else>
          Receive browser notifications when this tab is open. For notifications when the browser is closed, use the desktop or mobile app.
        </template>
      </p>

      <!-- Master toggle -->
      <div class="space-y-4">
        <label class="flex items-center justify-between cursor-pointer group">
          <div>
            <span class="text-sm font-medium text-gray-900 dark:text-white">Enable notifications</span>
            <p v-if="platform === 'browser' && browserPermission === 'denied'" class="text-xs text-red-500 mt-0.5">
              Notifications are blocked by your browser. Reset permissions in your browser's site settings.
            </p>
            <p v-else-if="needsBrowserPermission && settings.enabled" class="text-xs text-amber-500 mt-0.5">
              Browser permission required — click to allow.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            :aria-checked="settings.enabled"
            :class="[
              'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
              settings.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700',
            ]"
            @click="settings.enabled ? disable() : handleEnable()"
          >
            <span
              :class="[
                'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                settings.enabled ? 'translate-x-5' : 'translate-x-0',
              ]"
            />
          </button>
        </label>

        <!-- Sub-settings (only shown when enabled) -->
        <div v-if="settings.enabled" class="pl-0 space-y-3 border-t border-gray-100 dark:border-gray-800 pt-4">
          <!-- Messages -->
          <label class="flex items-center justify-between cursor-pointer">
            <div>
              <span class="text-sm text-gray-700 dark:text-gray-300">Messages</span>
              <p class="text-xs text-gray-400 dark:text-gray-500">New chat messages and mentions</p>
            </div>
            <button
              type="button"
              role="switch"
              :aria-checked="settings.messages"
              :class="[
                'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
                settings.messages ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700',
              ]"
              @click="toggle('messages')"
            >
              <span
                :class="[
                  'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                  settings.messages ? 'translate-x-4' : 'translate-x-0',
                ]"
              />
            </button>
          </label>

          <!-- Video calls -->
          <label class="flex items-center justify-between cursor-pointer">
            <div>
              <span class="text-sm text-gray-700 dark:text-gray-300">Video calls</span>
              <p class="text-xs text-gray-400 dark:text-gray-500">Incoming video call alerts</p>
            </div>
            <button
              type="button"
              role="switch"
              :aria-checked="settings.videoCalls"
              :class="[
                'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
                settings.videoCalls ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700',
              ]"
              @click="toggle('videoCalls')"
            >
              <span
                :class="[
                  'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                  settings.videoCalls ? 'translate-x-4' : 'translate-x-0',
                ]"
              />
            </button>
          </label>

          <!-- Sound -->
          <label class="flex items-center justify-between cursor-pointer">
            <div>
              <span class="text-sm text-gray-700 dark:text-gray-300">Sound</span>
              <p class="text-xs text-gray-400 dark:text-gray-500">Play a sound with notifications</p>
            </div>
            <button
              type="button"
              role="switch"
              :aria-checked="settings.soundEnabled"
              :class="[
                'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
                settings.soundEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700',
              ]"
              @click="toggle('soundEnabled')"
            >
              <span
                :class="[
                  'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                  settings.soundEnabled ? 'translate-x-4' : 'translate-x-0',
                ]"
              />
            </button>
          </label>
        </div>
      </div>
    </div>
  </Card>
</template>
