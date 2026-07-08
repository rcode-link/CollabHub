/**
 * Capacitor integration helper.
 * When running inside the Capacitor mobile wrapper, bridges native
 * notifications, badge counts, and app lifecycle via Capacitor plugins.
 */

import { colors as brandColors } from '@/brand-tokens.js'

export function isCapacitor() {
  return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform())
}

let LocalNotifications = null
let App = null
let Preferences = null

/**
 * Initialize Capacitor-specific features.
 * Dynamically imports plugins only when running in Capacitor.
 */
export async function initCapacitor() {
  if (!isCapacitor()) return

  try {
    const [
      { LocalNotifications: LN },
      { App: CapApp },
      { Preferences: Prefs },
    ] = await Promise.all([
      import('@capacitor/local-notifications'),
      import('@capacitor/app'),
      import('@capacitor/preferences'),
    ])

    LocalNotifications = LN
    App = CapApp
    Preferences = Prefs

    // Request notification permissions on first launch
    const { display } = await LocalNotifications.checkPermissions()
    if (display === 'prompt') {
      await LocalNotifications.requestPermissions()
    }

    // Handle app URL open (deep linking)
    App.addListener('appUrlOpen', (event) => {
      const url = new URL(event.url)
      // Navigate within the SPA if it's a known path
      if (url.pathname) {
        window.location.pathname = url.pathname
      }
    })

    // Handle back button (Android)
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back()
      }
    })

    // Hide splash screen after init
    try {
      const { SplashScreen } = await import('@capacitor/splash-screen')
      SplashScreen.hide()
    } catch { /* splash screen plugin not available */ }

    // Configure status bar
    try {
      const { StatusBar } = await import('@capacitor/status-bar')
      const theme = localStorage.getItem('color-theme')
      StatusBar.setStyle({ style: theme === 'dark' ? 'DARK' : 'LIGHT' })
      StatusBar.setBackgroundColor({ color: theme === 'dark' ? '#111827' : '#ffffff' })
    } catch { /* status bar plugin not available */ }

  } catch (err) {
    console.error('Failed to initialize Capacitor plugins:', err)
  }
}

/**
 * Show a native local notification.
 */
export async function showCapacitorNotification({ title, body }) {
  if (!isCapacitor() || !LocalNotifications) return

  await LocalNotifications.schedule({
    notifications: [
      {
        id: Date.now(),
        title: title || 'CollabHub',
        body: body || '',
        smallIcon: 'ic_notification',
        iconColor: brandColors.evergreen,
        sound: 'default',
      },
    ],
  })
}

/**
 * Update the app badge count (Android only — uses notification channel badge).
 */
export async function setCapacitorBadge(count) {
  // Badge count on mobile is typically handled by the OS via push notification payloads.
  // For local badge updates, we can use a persistent silent notification on Android.
  // On iOS, badge is set via push notification payload from the server.
  // This is a no-op for now — badge will be managed server-side via push notifications.
}

/**
 * Get the stored server URL.
 */
export async function getServerUrl() {
  if (!isCapacitor() || !Preferences) return null
  const { value } = await Preferences.get({ key: 'serverUrl' })
  return value
}

/**
 * Clear the stored server URL (for "change server" feature).
 */
export async function clearServerUrl() {
  if (!isCapacitor() || !Preferences) return
  await Preferences.remove({ key: 'serverUrl' })
}
