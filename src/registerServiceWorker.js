/* eslint-disable no-console */

import { register } from "register-service-worker";

// Register service worker
const registerServiceWorker = async () => {
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
            console.error("Error during service worker registration:", error);
        },
    });

    // Register simple caching worker
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/worker.js', {
                scope: '/',
                updateViaCache: 'none' // Force network-first approach for service worker updates
            });
            
            console.log('Cache service worker registered with scope:', registration.scope);
        } catch (error) {
            console.error('Error registering cache service worker:', error);
        }
    }
};

// Initialize the service worker
registerServiceWorker();