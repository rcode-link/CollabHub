self.addEventListener('push', event => {
  const data = event.data.json()
  // Show notification with the icon URL from the notification data
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/img/android/android-launchericon-512-512.png',
  })
})

// Shared display logic
function displayNotification(data) {
  const title = data.title || 'Fallback Title'
  const options = {
    body: data.body || 'Default body text',

    icon: '/img/android/android-launchericon-512-512.png',
  }
  return self.registration.showNotification(title, options)
}

// Handle manual messages
self.addEventListener('message', event => {
  const data = event.data
  if (data?.type === 'show-notification') {
    event.waitUntil(displayNotification(data))
  }
})

self.addEventListener('install', event => {
  console.log('Service Worker installing.')
  // Perform installation steps
})

self.addEventListener('activate', event => {
  console.log('Service Worker activating.')
  // Perform activation steps
})
