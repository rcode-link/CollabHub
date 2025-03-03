// Import Echo and Pusher libraries with error handling
self.Echo = null;

try {
  // Import our created minimal libraries that are compatible with Service Worker context
  importScripts("/build/assets/echo.iife.js", "/build/assets/pusher.min.js");
  console.log("Successfully imported Echo and Pusher libraries");
} catch (e) {
  console.error('Error importing scripts in service worker:', e.message);
}

const CACHE_NAME = 'collabhub-cache-v1';
const urlsToCache = [
  '/',
  '/index.php',
  '/build/assets/app.css',
  '/build/assets/app.js'
];

// Install event - cache essential files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Push notification event
self.addEventListener('push', event => {
  let data = {};
  if (event.data) {
    data = event.data.json();
  }

  const options = {
    body: data.body || 'New notification',
    icon: data.icon || '/logo.png',
    badge: '/logo.png',
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'CollabHub Notification', options)
  );
});

// Notification click event - open the relevant page
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.matchAll({type: 'window'})
        .then(windowClients => {
          // Check if there is already a window open with the URL
          for (let client of windowClients) {
            if (client.url === event.notification.data.url && 'focus' in client) {
              return client.focus();
            }
          }
          // If no window is open, open a new one
          if (clients.openWindow) {
            return clients.openWindow(event.notification.data.url);
          }
        })
    );
  }
});

// Handle messages from the main thread
self.onmessage = function(event) {
  console.log('Worker received message:', event.data);
  
  // Handle custom Echo configuration if needed
  if (event.data.type === 'configure-echo') {
    try {
      // Check if Echo is available (from imported script)
      if (typeof Echo !== 'undefined') {
        // Store Echo instance to use for notifications
        self.Echo = new Echo({
          broadcaster: "null", // Use null broadcaster in service worker context
          key: event.data.config.VITE_PUSHER_APP_KEY,
          cluster: event.data.config.VITE_PUSHER_APP_CLUSTER || "mt1",
          wsHost: event.data.config.VITE_PUSHER_HOST 
              ? event.data.config.VITE_PUSHER_HOST 
              : `ws-${event.data.config.VITE_PUSHER_APP_CLUSTER}.pusher.com`,
          wsPort: event.data.config.VITE_PUSHER_PORT || 80,
          wssPort: event.data.config.VITE_PUSHER_PORT || 443,
          forceTLS: (event.data.config.VITE_PUSHER_SCHEME || "https") === "https",
          encrypted: true,
          enabledTransports: ["ws", "wss"],
          authEndpoint: "/api/v1/pusher/auth",
          auth: {
            headers: {
              Authorization: `Bearer ${event.data.token || ''}`,
              "X-CSRF-TOKEN": event.data.csrf || '',
            },
          },
        });
        
        console.log("Echo configured in service worker");
        
        // Notify the main thread that we're ready for notifications
        if (event.source && event.source.postMessage) {
          event.source.postMessage({
            type: 'echo-configured',
            success: true
          });
        }
      } else {
        console.error("Echo library not available in service worker");
      }
    } catch (error) {
      console.error("Error configuring Echo in service worker:", error);
    }
  } else if (event.data.type === 'notification') {
    // Handle a notification request from the main thread
    showNotification(event.data.notification);
  }
};

// Helper function to show notifications
function showNotification(data) {
  const options = {
    body: data.body || 'New notification',
    icon: data.icon || '/logo.png',
    badge: '/logo.png',
    data: {
      url: data.url || '/'
    }
  };

  self.registration.showNotification(data.title || 'CollabHub Notification', options);
}
