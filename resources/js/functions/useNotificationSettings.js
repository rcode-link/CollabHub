import { ref, computed } from 'vue'
import { isElectron } from '@/functions/useElectron.js'

const STORAGE_KEY = 'notification-settings'

/**
 * Detect the current platform.
 * - 'electron' — Electron desktop app
 * - 'capacitor' — Capacitor mobile app (local assets with bridge)
 * - 'android' — Android WebView loading remote URL (native bridge via CollabHubAndroid)
 * - 'browser' — regular browser tab
 */
export function getPlatform() {
  if (isElectron()) return 'electron'
  if (window.Capacitor?.isNativePlatform?.()) return 'capacitor'
  if (window.CollabHubAndroid) return 'android'
  return 'browser'
}

function getDefaults() {
  const platform = getPlatform()
  return {
    // Native apps (Electron/Capacitor/Android) have notifications on by default
    enabled: platform === 'electron' || platform === 'capacitor' || platform === 'android',
    messages: true,
    videoCalls: true,
    soundEnabled: true,
  }
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...getDefaults(), ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return getDefaults()
}

function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

/**
 * Composable for notification preferences.
 */
export function useNotificationSettings() {
  const platform = getPlatform()
  const settings = ref(loadSettings())
  const browserPermission = ref(
    typeof Notification !== 'undefined' ? Notification.permission : 'default',
  )

  const isNativeApp = computed(() => platform === 'electron' || platform === 'capacitor' || platform === 'android')

  const canNotify = computed(() => {
    if (isNativeApp.value) {
      // Desktop/mobile apps can always show notifications
      return settings.value.enabled
    }
    // Browser needs both user setting ON and browser permission granted
    return settings.value.enabled && browserPermission.value === 'granted'
  })

  const needsBrowserPermission = computed(() => {
    return platform === 'browser' && browserPermission.value !== 'granted'
  })

  /**
   * Enable notifications. On browser, requests permission first.
   */
  async function enable() {
    if (platform === 'browser') {
      if (!('Notification' in window)) return false

      const permission = await Notification.requestPermission()
      browserPermission.value = permission

      if (permission !== 'granted') return false
    }

    settings.value.enabled = true
    saveSettings(settings.value)
    return true
  }

  function disable() {
    settings.value.enabled = false
    saveSettings(settings.value)
  }

  function toggle(key) {
    if (['messages', 'videoCalls', 'soundEnabled'].includes(key)) {
      settings.value[key] = !settings.value[key]
      saveSettings(settings.value)
    }
  }

  /**
   * Check if a specific notification type should be shown.
   */
  function shouldNotify(type) {
    if (!canNotify.value) return false
    if (type === 'message') return settings.value.messages
    if (type === 'videoCall') return settings.value.videoCalls
    return true
  }

  return {
    platform,
    settings,
    isNativeApp,
    canNotify,
    needsBrowserPermission,
    browserPermission,
    enable,
    disable,
    toggle,
    shouldNotify,
  }
}
