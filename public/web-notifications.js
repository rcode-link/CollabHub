if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/worker.js?v=1.2')
    .then(function (registration) {
      console.log('Service Worker registered with scope:', registration.scope)
    })
    .catch(function (error) {
      console.log('Service Worker registration failed:', error)
    })
}

// navigator.serviceWorker.ready
//   .then(function (registration) {
//     return registration.pushManager.subscribe({
//       userVisibleOnly: true,
//       applicationServerKey: urlBase64ToUint8Array(
//         'BFHChgedr72giDXoNxYixadXfFXg9UNSf2iJrI-S3s3TSjZGnuaNHKn6RiTrzt86NbVZTsaFrs4Lq3N11NXKgD8',
//       ),
//     })
//   })
//   .then(function (subscription) {
//     const token = localStorage.getItem('token')
//     fetch('/api/v1/push-notification', {
//       method: 'POST',
//       body: JSON.stringify(subscription),
//       headers: {
//         Authorization: `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//     })
//   })

// function urlBase64ToUint8Array(base64String) {
//   const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
//   const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
//
//   const rawData = window.atob(base64)
//   const outputArray = new Uint8Array(rawData.length)
//
//   for (let i = 0; i < rawData.length; ++i) {
//     outputArray[i] = rawData.charCodeAt(i)
//   }
//   return outputArray
// }
