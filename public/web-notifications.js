// Only initialize push notifications after user interaction

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/worker.js?v=1.2', { scope: '/' })
    .then(function (registration) {
      console.log('Service Worker registered with scope:', registration.scope)

      // Wait for the service worker to be ready before subscribing
      return navigator.serviceWorker.ready
    })
    .then(function (serviceWorkerRegistration) {
      console.log('Service worker is ready, subscribing to push...')

      return serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          'BFHChgedr72giDXoNxYixadXfFXg9UNSf2iJrI-S3s3TSjZGnuaNHKn6RiTrzt86NbVZTsaFrs4Lq3N11NXKgD8',
        ),
      })
    })
    .then(function (subscription) {
      console.log('Push subscription successful:', subscription)

      // Send the subscription to your server
      return sendSubscriptionToServer(subscription)
    })
    .catch(function (error) {
      console.error('Service Worker or push subscription error:', error)

      // Provide more specific error messages for mobile users
      if (error.name === 'NotAllowedError') {
        alert(
          'Push notifications are blocked. Please enable them in your browser settings.',
        )
      } else if (
        /iPhone|iPad|iPod/.test(navigator.userAgent) &&
        parseInt(navigator.userAgent.match(/OS (\d+)_/)[1], 10) < 16
      ) {
        alert(
          'Push notifications are not supported in your iOS version. iOS 16.4 or later is required.',
        )
      }
    })
} else {
  console.error('Service workers are not supported in this browser.')

  // Inform users on unsupported browsers
  if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
    alert(
      'To receive push notifications on iOS, please add this website to your home screen and open it from there.',
    )
  }
}

function sendSubscriptionToServer(subscription) {
  const token = localStorage.getItem('token')

  return fetch('/api/v1/push-notification', {
    method: 'POST',
    body: JSON.stringify(subscription),
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }).then(response => {
    if (!response.ok) {
      console.error('Push subscription failed:', response.statusText)
      throw new Error('Failed to register push notification with server')
    } else {
      console.log('Push subscription registered with server successfully.')
      return response.json()
    }
  })
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Add this function to detect if the app is running as installed PWA
function isPWA() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone || // iOS Safari
    document.referrer.includes('android-app://')
  )
}

// Check if this is iOS and show appropriate guidance
function checkIOSSupport() {
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent)
  const iOSVersion = isIOS
    ? parseInt(navigator.userAgent.match(/OS (\d+)_/)[1], 10)
    : 0

  if (isIOS) {
    if (iOSVersion < 16) {
      return 'Your iOS version does not support push notifications. Please update to iOS 16.4 or later.'
    } else if (!isPWA()) {
      return 'To receive push notifications on iOS, add this site to your home screen and open it from there.'
    }
  }
  return null
}
