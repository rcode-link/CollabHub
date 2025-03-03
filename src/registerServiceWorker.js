/* eslint-disable no-console */

import { register } from "register-service-worker";

// Register both service workers
const registerServiceWorkers = async () => {
    // Register the main service worker
    register(`/build/sw.js`, {
        ready() {
            console.log(
                "App is being served from cache by a service worker.\n" +
                    "For more details, visit https://goo.gl/AFskqB"
            );
        },
        async registered() {
            console.log("Main service worker has been registered.");
        },
        cached() {
            console.log("Content has been cached for offline use.");
        },
        updatefound() {
            console.log("New content is downloading.");
        },
        updated() {
            console.log("New content is available; please refresh.");
        },
        offline() {
            console.log(
                "No internet connection found. App is running in offline mode."
            );
        },
        error(error) {
            console.error("Error during main service worker registration:", error);
        },
    });

    // Register our custom worker for push notifications
    if ('serviceWorker' in navigator) {
        try {
            // Request notification permission
            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
                console.log("Notification permission denied");
                return;
            }

            // Register the notification worker
            const registration = await navigator.serviceWorker.register('/worker.js', {
                scope: '/'
            });
            
            console.log('Notification service worker registered with scope:', registration.scope);

            // Configure the worker with environment variables from data attributes
            if (registration.active) {
                // Get environment data from data-env attribute
                const envEl = document.querySelector('body');
                const envData = envEl ? JSON.parse(envEl.getAttribute('data-env') || '{}') : {};
                
                registration.active.postMessage({
                    type: 'configure-echo',
                    config: {
                        VITE_PUSHER_APP_KEY: envData.VITE_PUSHER_APP_KEY,
                        VITE_PUSHER_APP_CLUSTER: envData.VITE_PUSHER_APP_CLUSTER,
                        VITE_PUSHER_HOST: envData.VITE_PUSHER_HOST,
                        VITE_PUSHER_PORT: envData.VITE_PUSHER_PORT,
                        VITE_PUSHER_SCHEME: envData.VITE_PUSHER_SCHEME,
                    },
                    token: localStorage.getItem("token"),
                    csrf: document.querySelector('meta[name="csrf-token"]')?.getAttribute("content")
                });
            }

            // Subscribe to push notifications (if using web push)
            // This requires a backend push service with VAPID keys
            /*
            // Get environment data from data-env attribute (if not already retrieved)
            if (!envData) {
                const envEl = document.querySelector('body');
                var envData = envEl ? JSON.parse(envEl.getAttribute('data-env') || '{}') : {};
            }
            
            const convertedVapidKey = urlBase64ToUint8Array(envData.VITE_VAPID_PUBLIC_KEY);
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey
            });
            
            // Send the subscription to your server
            await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("token")}`,
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute("content")
                },
                body: JSON.stringify({ subscription })
            });
            */
            
            console.log('Push notification subscription successful');
        } catch (error) {
            console.error('Error registering notification service worker:', error);
        }
    }
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// Initialize the service workers
registerServiceWorkers();
