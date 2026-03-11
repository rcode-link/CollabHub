/**
 * Electron integration helper.
 * When running inside the Electron wrapper, bridges native notifications
 * and badge counts via the preload API exposed on window.electronAPI.
 */

export function isElectron() {
  return !!(window.electronAPI && window.electronAPI.isElectron)
}

/**
 * Initialize Electron-specific features.
 * Call this once after the app mounts (e.g. in useInit).
 */
export function initElectron() {
  if (!isElectron()) return

  // Notification handling is done in useInit.js via sendNotificationEvent()
  // which calls showAppNotification() — no separate listener needed here.
}

/**
 * Show a native Electron notification.
 */
export function showElectronNotification({ title, body }) {
  if (!isElectron()) return
  window.electronAPI.showNotification({ title, body })
}

/**
 * Update the dock/taskbar badge with unread message count.
 */
export function setElectronBadge(count) {
  if (!isElectron()) return
  window.electronAPI.setBadgeCount(count)
}
