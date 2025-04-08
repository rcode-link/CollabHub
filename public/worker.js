// worker.js
self.addEventListener('install', function (event) {
  console.log('Service Worker installing.')
  // Perform installation steps, e.g., caching assets
  event.waitUntil(
    caches.open('my-cache').then(function (cache) {
      return cache.addAll(['/', '/index.html', '/styles.css', '/app.js'])
    }),
  )
})

self.addEventListener('activate', function (event) {
  console.log('Service Worker activating.')
  // Perform activation steps, e.g., cleaning up old caches
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== 'my-cache') {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})

self.addEventListener('message', function (event) {
  if (event.data.type === 'showNotification') {
    self.registration.showNotification(event.data.title, {
      body: event.data.body,
      tag: 'single-notification',
    })
  }
})
