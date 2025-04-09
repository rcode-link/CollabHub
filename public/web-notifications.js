// Only initialize push notifications after user interaction
function initializeNotifications() {
  // First request notification permission
  Notification.requestPermission().then(function (permission) {
    if (permission === 'granted') {
      console.log('Notification permission granted.')
      // Only register service worker after permission is granted
      registerServiceWorker()
    } else {
      console.error('Notification permission denied.')
    }
  })
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/worker.js', { scope: '/' }) // Removed version query parameter
      .then(function (registration) {
        console.log('Service Worker registered with scope:', registration.scope)

        // Add a delay before subscribing to ensure the service worker is fully activated
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(navigator.serviceWorker.ready)
          }, 1000) // 1 second delay
        })
      })
      .then(function (serviceWorkerRegistration) {
        console.log('Service worker is ready, subscribing to push...')

        // Check if push manager is supported
        if (!serviceWorkerRegistration.pushManager) {
          throw new Error('Push manager not supported in this browser')
        }

        // Check for existing subscriptions first
        return serviceWorkerRegistration.pushManager
          .getSubscription()
          .then(existingSubscription => {
            if (existingSubscription) {
              console.log(
                'Existing push subscription found:',
                existingSubscription,
              )
              return existingSubscription
            }

            // Create new subscription with proper error handling
            console.log('Creating new push subscription...')
            const vapidPublicKey =
              'BFHChgedr72giDXoNxYixadXfFXg9UNSf2iJrI-S3s3TSjZGnuaNHKn6RiTrzt86NbVZTsaFrs4Lq3N11NXKgD8'

            // Verify that the key conversion works correctly
            try {
              const convertedKey = urlBase64ToUint8Array(vapidPublicKey)
              console.log(
                'Application server key converted successfully, length:',
                convertedKey.length,
              )

              // Use a timeout to prevent hanging subscriptions
              return Promise.race([
                serviceWorkerRegistration.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: convertedKey,
                }),
                new Promise((_, reject) =>
                  setTimeout(
                    () => reject(new Error('Subscription timed out')),
                    10000,
                  ),
                ),
              ])
            } catch (err) {
              console.error('Error converting application server key:', err)
              throw new Error('Failed to process application server key')
            }
          })
      })
      .then(function (subscription) {
        console.log('Push subscription successful:', subscription)

        // Send the subscription to your server
        return sendSubscriptionToServer(subscription)
      })
      .catch(function (error) {
        console.error('Service Worker or push subscription error:', error)

        // Provide specific error handling based on error type
        if (error.name === 'NotAllowedError') {
          alert(
            'Push notifications are blocked. Please enable them in your browser settings.',
          )
        } else if (error.name === 'AbortError') {
          // Specific handling for AbortError
          console.log('Attempting alternative subscription method...')
          retrySubscriptionWithFallback()
        } else if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
          // iOS specific error handling
          const iOSVersion = parseInt(
            (navigator.userAgent.match(/OS (\d+)_/) || [])[1] || 0,
            10,
          )
          if (iOSVersion < 16) {
            alert(
              'Push notifications are not supported in your iOS version. iOS 16.4 or later is required.',
            )
          } else if (!isPWA()) {
            alert(
              'To receive push notifications on iOS, add this website to your home screen and open it from there.',
            )
          }
        } else {
          alert('Failed to enable push notifications. Error: ' + error.message)
        }
      })
  } else {
    console.error('Service workers are not supported in this browser.')
    alert('Your browser does not support push notifications.')
  }
}

// Fallback method that tries with different options
function retrySubscriptionWithFallback() {
  navigator.serviceWorker.ready.then(registration => {
    // Try with minimal options first
    registration.pushManager
      .subscribe({ userVisibleOnly: true })
      .then(subscription => {
        console.log('Fallback subscription successful:', subscription)
        return sendSubscriptionToServer(subscription)
      })
      .catch(err => {
        console.error('Fallback subscription also failed:', err)
        alert(
          'Push notification setup failed. Your browser may have restrictions on this feature.',
        )
      })
  })
}

function sendSubscriptionToServer(subscription) {
  const token = localStorage.getItem('token') || ''
  console.log('Sending subscription to server...')

  // Convert the subscription to a simple object that can be stringified
  const subscriptionJson = subscription.toJSON()

  return fetch('/api/v1/push-notification', {
    method: 'POST',
    body: JSON.stringify(subscriptionJson),
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  }).then(response => {
    if (!response.ok) {
      console.error('Push subscription failed on server:', response.statusText)
      throw new Error('Failed to register push notification with server')
    } else {
      console.log('Push subscription registered with server successfully.')
      return response.json()
    }
  })
}

function urlBase64ToUint8Array(base64String) {
  // Remove any whitespace from the base64 string
  const trimmedBase64 = base64String.trim()

  // Calculate padding
  const padding = '='.repeat((4 - (trimmedBase64.length % 4)) % 4)
  const base64 = (trimmedBase64 + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')

  try {
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  } catch (e) {
    console.error('Base64 conversion error:', e)
    throw new Error('Invalid base64 string')
  }
}

// Add this function to detect if the app is running as installed PWA
function isPWA() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone || // iOS Safari
    document.referrer.includes('android-app://')
  )
}

// Function to check browser compatibility for push notifications
function checkPushCompatibility() {
  const report = {
    serviceWorkerSupported: 'serviceWorker' in navigator,
    pushManagerSupported: false,
    notificationsSupported: 'Notification' in window,
    permissionStatus: Notification.permission,
  }

  if (report.serviceWorkerSupported) {
    navigator.serviceWorker.ready.then(reg => {
      report.pushManagerSupported = 'pushManager' in reg
      console.log('Push compatibility report:', report)
    })
  } else {
    console.log('Push compatibility report:', report)
  }

  return report
}

// Run compatibility check on load
window.addEventListener('load', () => {
  checkPushCompatibility()
})
