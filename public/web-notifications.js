if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/worker.js?v=1.2', {
      scope: '/',
    })
    .then(function (registration) {
      console.log('Service Worker registered with scope:', registration.scope)
      // Access the ready property only after successful registration
      return registration.ready
    })
  navigator.serviceWorker.ready
    .then(function (serviceWorkerRegistration) {
      const sub = serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
      })
      console.log(sub)
    })
    // .then(function (subscription) {
    //   const token = localStorage.getItem('token')
    //   fetch('/api/v1/push-notification', {
    //     method: 'POST',
    //     body: JSON.stringify(subscription),
    //     headers: {
    //       Authorization: `Bearer ${token}`,
    //       'Content-Type': 'application/json',
    //     },
    //   }).then(response => {
    //     if (!response.ok) {
    //       console.error('Push subscription failed:', response.statusText)
    //     } else {
    //       console.log('Push subscription successful.')
    //     }
    //   })
    // })
    .catch(function (error) {
      console.error('Service Worker or push subscription error:', error)
    })
} else {
  console.error('Service workers are not supported in this browser.')
}

Notification.requestPermission().then(function (result) {
  if (result === 'granted') {
    console.log('Notification permission granted.')
  } else {
    console.error('Notification permission denied.')
  }
})

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
