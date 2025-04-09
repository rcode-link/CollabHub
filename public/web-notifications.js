if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/worker.js?v=1.2')
    .then(function (registration) {
      if (registration) {
        console.log('Service Worker registered with scope:', registration.scope)
        return registration.ready
      } else {
        console.error('Service Worker registration returned undefined.')
      }
    })
    .catch(function (error) {
      console.error('Service Worker registration failed:', error)
    })
} else {
  console.warn('Service Workers are not supported in this browser.')
}
