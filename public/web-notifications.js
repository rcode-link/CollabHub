if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/worker.js?v=1.2')
    .then(function (registration) {
      console.log('Service Worker registered with scope:', registration.scope)

      // Request notification permission
      Notification.requestPermission().then(function (permission) {
        if (permission === 'granted') {
          console.log('Notification permission granted.')

          // Subscribe to push notifications
          registration.pushManager
            .subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(
                'BFHChgedr72giDXoNxYixadXfFXg9UNSf2iJrI-S3s3TSjZGnuaNHKn6RiTrzt86NbVZTsaFrs4Lq3N11NXKgD8',
              ),
            })
            .then(function (subscription) {
              console.log('User is subscribed:', subscription)

              // Send the subscription to your server
              sendSubscriptionToServer(subscription)
            })
            .catch(function (error) {
              console.error('Failed to subscribe the user: ', error)
            })
        } else {
          console.warn('Notification permission denied.')
        }
      })
    })
    .catch(function (error) {
      console.error('Service Worker registration failed:', error)
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

function sendSubscriptionToServer(subscription) {
  // Implement this function to send the subscription to your server
}
