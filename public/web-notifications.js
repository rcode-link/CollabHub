// Main initialization function - call this when a user clicks a button
function initializePushNotifications() {
  // First check browser compatibility
  checkPushCompatibility().then(report => {
    console.log('Push compatibility report:', report)

    // If notifications aren't supported, inform the user and exit
    if (!report.notificationsSupported) {
      console.error('Notifications are not supported in this browser.')
      alert('Your browser does not support push notifications.')
      return
    }

    // Request permission if not already granted
    if (report.permissionStatus !== 'granted') {
      return Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notification permission granted.')
          return setupPushSubscription()
        } else {
          console.error('Notification permission denied.')
          alert(
            'Push notifications were denied. Please enable them in your browser settings to receive updates.',
          )
          return null
        }
      })
    } else {
      // Permission already granted, proceed with setup
      return setupPushSubscription()
    }
  })
}

// Check browser compatibility for push notifications
function checkPushCompatibility() {
  return new Promise(resolve => {
    const report = {
      serviceWorkerSupported: 'serviceWorker' in navigator,
      pushManagerSupported: false,
      notificationsSupported: 'Notification' in window,
      permissionStatus: Notification.permission,
      platform: {
        isIOS: /iPhone|iPad|iPod/.test(navigator.userAgent),
        isAndroid: /Android/.test(navigator.userAgent),
        browserName: getBrowserName(),
      },
    }

    if (report.serviceWorkerSupported) {
      navigator.serviceWorker.ready
        .then(reg => {
          report.pushManagerSupported = 'pushManager' in reg
          resolve(report)
        })
        .catch(() => {
          resolve(report)
        })
    } else {
      resolve(report)
    }
  })
}

// Helper to detect browser name
function getBrowserName() {
  const userAgent = navigator.userAgent
  if (userAgent.indexOf('Firefox') > -1) return 'Firefox'
  if (userAgent.indexOf('SamsungBrowser') > -1) return 'Samsung'
  if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1)
    return 'Opera'
  if (userAgent.indexOf('Trident') > -1) return 'IE'
  if (userAgent.indexOf('Edge') > -1) return 'Edge'
  if (userAgent.indexOf('Chrome') > -1) return 'Chrome'
  if (userAgent.indexOf('Safari') > -1) return 'Safari'
  return 'Unknown'
}

// Setup push subscription
function setupPushSubscription() {
  if (!('serviceWorker' in navigator)) {
    console.error('Service workers are not supported in this browser.')
    return Promise.reject('Service workers not supported')
  }

  // Register the service worker first
  return navigator.serviceWorker
    .register('/worker.js', { scope: '/' })
    .then(registration => {
      console.log('Service Worker registered with scope:', registration.scope)

      // Give service worker time to activate
      return new Promise(resolve => {
        if (navigator.serviceWorker.controller) {
          // Service worker is already controlling the page
          resolve(registration)
        } else {
          // Wait for the service worker to control the page
          let serviceWorkerTimeout = setTimeout(() => {
            console.log(
              'Service worker activation timed out, proceeding anyway',
            )
            resolve(registration)
          }, 2000)

          navigator.serviceWorker.addEventListener('controllerchange', () => {
            clearTimeout(serviceWorkerTimeout)
            resolve(registration)
          })
        }
      })
    })
    .then(registration => {
      console.log(
        'Service worker is ready, checking for existing subscription...',
      )

      // Check for existing subscription
      return registration.pushManager
        .getSubscription()
        .then(existingSubscription => {
          if (existingSubscription) {
            console.log('Existing push subscription found')
            return existingSubscription
          }

          // Create new subscription
          console.log('No existing subscription found, creating new one...')

          try {
            const vapidPublicKey =
              'BFHChgedr72giDXoNxYixadXfFXg9UNSf2iJrI-S3s3TSjZGnuaNHKn6RiTrzt86NbVZTsaFrs4Lq3N11NXKgD8'
            const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey)

            console.log('Attempting to subscribe to push service...')
            return registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: convertedVapidKey,
            })
          } catch (error) {
            console.error('Error during push subscription:', error)
            return tryFallbackSubscription(registration)
          }
        })
    })
    .then(subscription => {
      if (subscription) {
        console.log('Push subscription successful:', subscription)
        return sendSubscriptionToServer(subscription)
      }
    })
    .catch(error => {
      console.error('Push subscription error:', error)

      // Provide specific error handling
      if (error.name === 'NotAllowedError') {
        alert(
          'Push notifications are blocked. Please enable them in your browser settings.',
        )
      } else if (error.name === 'AbortError') {
        console.log('AbortError detected, trying fallback...')
        return navigator.serviceWorker.ready.then(registration =>
          tryFallbackSubscription(registration),
        )
      } else {
        alert('Failed to enable push notifications. Please try again later.')
      }

      return null
    })
}

// Try alternative subscription approach (fallback)
function tryFallbackSubscription(registration) {
  console.log('Attempting fallback subscription method...')

  return new Promise((resolve, reject) => {
    // Add slight delay before retry
    setTimeout(() => {
      // Try with minimal options first
      registration.pushManager
        .subscribe({ userVisibleOnly: true })
        .then(subscription => {
          console.log('Fallback subscription successful')
          resolve(subscription)
        })
        .catch(err => {
          console.error('Fallback subscription also failed:', err)
          reject(err)
        })
    }, 1000)
  })
}

// Send subscription to server
function sendSubscriptionToServer(subscription) {
  if (!subscription) {
    console.error('No subscription to send to server')
    return Promise.reject('No subscription available')
  }

  console.log('Sending subscription to server...')

  // Get auth token if available
  const token = localStorage.getItem('token') || ''

  // Convert subscription to plain object for JSON
  const subscriptionJson = subscription.toJSON
    ? subscription.toJSON()
    : subscription

  return fetch('/api/v1/push-notification', {
    method: 'POST',
    body: JSON.stringify(subscriptionJson),
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  })
    .then(response => {
      if (!response.ok) {
        console.error(
          'Server registration failed:',
          response.status,
          response.statusText,
        )
        throw new Error('Failed to register with server')
      }

      console.log('Successfully registered with notification server')
      return response.json()
    })
    .catch(error => {
      console.error('Error sending subscription to server:', error)
      // Continue anyway - the client-side setup is complete
      // The server registration can be retried later
      return null
    })
}

// Convert base64 string to Uint8Array for applicationServerKey
function urlBase64ToUint8Array(base64String) {
  // Remove any whitespace from the base64 string
  const trimmedBase64 = base64String.trim()

  // Calculate padding
  const padding = '='.repeat((4 - (trimmedBase64.length % 4)) % 4)

  // Convert to standard base64
  const base64 = (trimmedBase64 + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')

  // Create byte array
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

// Function to detect if the app is running as installed PWA
function isPWA() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone || // iOS Safari
    document.referrer.includes('android-app://')
  )
}

// Check iOS version and provide guidance if needed
function checkIOSSupport() {
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent)
  if (!isIOS) return null

  const iOSVersion = parseInt(
    (navigator.userAgent.match(/OS (\d+)_/) || [])[1] || 0,
    10,
  )

  if (iOSVersion < 16) {
    return 'Your iOS version does not support push notifications. Please update to iOS 16.4 or later.'
  } else if (!isPWA()) {
    return 'To receive push notifications on iOS, add this site to your home screen and open it from there.'
  }

  return null
}

// Unsubscribe function - useful for testing or allowing users to opt out
function unsubscribeFromPushNotifications() {
  if (!('serviceWorker' in navigator)) {
    return Promise.reject('Service workers not supported')
  }

  return navigator.serviceWorker.ready
    .then(registration => {
      return registration.pushManager.getSubscription()
    })
    .then(subscription => {
      if (!subscription) {
        console.log('No push subscription found to unsubscribe from')
        return null
      }

      // Unsubscribe from push service
      return subscription.unsubscribe().then(successful => {
        if (successful) {
          console.log('Successfully unsubscribed from push notifications')
          // Optionally notify your server that this subscription is no longer valid
          return true
        } else {
          console.error('Failed to unsubscribe from push notifications')
          return false
        }
      })
    })
}

// Auto-initialize if a button with id='enable-notifications' exists
document.addEventListener('DOMContentLoaded', function () {
  // Show iOS-specific guidance if needed
  const iosMessage = checkIOSSupport()
  if (iosMessage) {
    const iosInfoElement = document.getElementById('ios-info')
    const iosMessageElement = document.getElementById('ios-message')

    if (iosInfoElement && iosMessageElement) {
      iosMessageElement.textContent = iosMessage
      iosInfoElement.classList.add('visible')
    } else {
      console.log('iOS guidance:', iosMessage)
    }
  }
})

// Export functions for external use
window.pushNotifications = {
  initialize: initializePushNotifications,
  unsubscribe: unsubscribeFromPushNotifications,
  checkCompatibility: checkPushCompatibility,
}
