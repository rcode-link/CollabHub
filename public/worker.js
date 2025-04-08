self.addEventListener('push', event => {
    console.log('Push event received:', event)
    const data = event.data.json()

    // Show notification with the icon URL from the notification data
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon, // Use the icon URL from the notification data
        data: {
            chat_id: data.chat_id, // Ensure chat_id is included in the notification data
        },
        actions: [{ action: 'notification_action', title: 'View App' }],
    })
})

self.addEventListener('notificationclick', event => {
    console.log('Notification click received:', event)

    // Close the notification
    event.notification.close()

    // Get the chat_id from the notification data
    const chatId = event.notification.data.chat_id
    if (!chatId) {
        console.error('Chat ID is undefined')
        return
    }

    const notificationUrl = `/chat/${chatId}/view` // Construct the URL using the chat_id

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            // Check if there is already a window/tab open with the target URL
            for (let client of windowClients) {
                // If so, focus it
                if (client.url.endsWith(notificationUrl)) {
                    return client.focus()
                }
            }
            // If not, open a new window/tab with the target URL
            if (clients.openWindow) {
                return clients.openWindow(notificationUrl)
            }
        }),
    )
})
