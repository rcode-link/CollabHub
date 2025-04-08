if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/worker.js')
    .then(function (registration) {
      console.log('Service Worker registered with scope:', registration.scope)

      // Listen for updates to the service worker
      registration.onupdatefound = function () {
        const installingWorker = registration.installing
        console.log('Service Worker installing.')

        installingWorker.onstatechange = function () {
          switch (installingWorker.state) {
            case 'installed':
              if (navigator.serviceWorker.controller) {
                // At this point, the old content will have been purged and the fresh content will have been added to the cache.
                console.log('New or updated content is available.')
              } else {
                // At this point, everything has been precached.
                console.log('Content is now available offline!')
              }
              break
            case 'redundant':
              console.error('The installing service worker became redundant.')
              break
          }
        }
      }

      // Listen for the controllerchange event
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        console.log('Service Worker controller changed')
        // Now you can send messages to the new controller
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'showNotification',
            title: 'Service Worker Activated',
            body: 'The service worker is now active.',
          })
        }
      })

      // Check if the service worker is active
      if (navigator.serviceWorker.controller) {
        console.log(
          'Active Service Worker found:',
          navigator.serviceWorker.controller,
        )
      } else {
        console.log(
          'No active Service Worker found. It might be installing or waiting to activate.',
        )
      }

      // Listen for the custom event from the app
      document.addEventListener('customEvent', function (event) {
        console.log(event)
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'showNotification',
            title: event.detail.title,
            body: event.detail.body,
          })
        } else {
          console.log('Cannot send message: No active Service Worker')
        }
      })
    })
    .catch(function (error) {
      console.error('Service Worker registration failed:', error)
    })
} else {
  console.log('Service Workers are not supported in this browser.')
}
