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
  // Use skipWaiting() to ensure the service worker activates immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches and take control immediately
self.addEventListener('activate', event => {
  // This ensures the service worker takes control of clients immediately
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.filter(cacheName => {
            return cacheName !== CACHE_NAME;
          }).map(cacheName => {
            return caches.delete(cacheName);
          })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim()
    ])
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
  console.log(data);

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

// Notification click event - just focus the window
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  // Just focus the existing window without changing navigation
  event.waitUntil(
    clients.matchAll({type: 'window'})
      .then(windowClients => {
        // Find windows that are already open
        if (windowClients.length > 0) {
          // Focus the first window we find without changing its URL
          for (let client of windowClients) {
            if ('focus' in client) {
              return client.focus();
            }
          }
        }
        
        // If no window is open, open a new one at root URL
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// Handle messages from the main thread
self.onmessage = function(event) {
  console.log('Worker received message:', event.data);
  
  // Handle client claiming (for GrapheneOS compatibility)
  if (event.data.type === 'claim-clients') {
    self.clients.claim().then(() => {
      console.log('Service worker claimed all clients');
    }).catch(err => {
      console.error('Error claiming clients:', err);
    });
  }
  // Handle custom Echo configuration if needed
  else if (event.data.type === 'configure-echo') {
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
    
    // Also try to wake up any clients
    self.clients.matchAll({type: 'window'}).then(clients => {
      if (clients.length === 0) {
        // No clients - might be completely in background on GrapheneOS
        console.log('No client windows found, app may be in background');
      } else {
        console.log('Found ' + clients.length + ' client windows');
      }
    });
  }
};

// Helper function to show notifications with more options for GrapheneOS
function showNotification(data) {
  console.log(data);
  const options = {
    body: data.body || 'New notification',
    icon: data.icon || '/logo.png',
    badge: '/logo.png',
    tag: data.tag || 'notification-' + Date.now(),
    timestamp: data.timestamp || Date.now(),
    requireInteraction: data.requireInteraction !== undefined ? data.requireInteraction : true,
    renotify: data.renotify !== undefined ? data.renotify : true,
    vibrate: [200, 100, 200], // Add vibration pattern for mobile
    actions: [
      {
        action: 'open',
        title: 'Open App',
      }
    ],
    data: {
      url: data.url || '/',
      ...data // Include all data properties
    }
  };

  // For GrapheneOS on Vanadium, ensure high priority
  try {
    // Use showNotification with await to ensure it completes
    return self.registration.showNotification(data.title || 'CollabHub Notification', options);
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}
