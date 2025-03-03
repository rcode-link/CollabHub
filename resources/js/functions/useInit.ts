import { useUserStore } from "../store/user.js";
import { Ability, AbilityBuilder } from "@casl/ability";
import ability from "./ability.js";
import { ref, watch } from "vue";
import { initEcho } from "../bootstrap.js";
import { useTextToLinkStore } from "../store/textToLinkStore";
import { chatDetails } from "../store/chatStore.js";

import "../declaration.js";
import { toast } from "vue3-toastify";
import { useRouter } from "vue-router";
//@ts-ignore
import VideoToast from "../components/shared/video/VideoToast.vue";
import { initAxios } from "@/axios.js";

// Track window focus state
const isWindowFocused = ref(typeof document !== 'undefined' ? document.hasFocus() : true);

// Flag to track whether app is running in standalone PWA mode
const isPWA = ref(typeof window !== 'undefined' && (
    window.matchMedia('(display-mode: standalone)').matches || 
    window.navigator.standalone || 
    document.referrer.includes('android-app://')
));
export default () => {
    const userState = useUserStore();
    const messagesState = chatDetails();
    const router = useRouter();

    if (!localStorage.getItem("token")) {
        return;
    }

    const textToLinkStore = useTextToLinkStore();
    const notificationPermissionGranted = ref(Notification.permission === 'granted');
    
    // Setup window focus/blur event listeners
    const setupFocusListeners = () => {
        if (typeof window === 'undefined') return;
        
        window.addEventListener('focus', () => {
            isWindowFocused.value = true;
            console.log('Window is now focused');
        });
        
        window.addEventListener('blur', () => {
            isWindowFocused.value = false;
            console.log('Window is now blurred');
        });
        
        // Also listen for visibility changes which is more reliable in some cases
        document.addEventListener('visibilitychange', () => {
            isWindowFocused.value = document.visibilityState === 'visible';
            console.log('Visibility changed:', document.visibilityState);
        });
    };

    initEcho();
    initAxios();
    textToLinkStore.load();

    // Save original page title
    if (!userState.originalTitle) {
        userState.originalTitle = document.title;
    }

    // Notification will always be shown when conditions are met
    const shouldIShowNotification = () => {
        return true;
    };

    window.axios
        .get("/api/v1/companies")
        .then((response) => userState.setCompany(response.data));

    window.axios.get("/api/v1/user").then((res) => {
        userState.setUser(res.data);
        loadNumberOfUnreadMessages();

        window.Echo.private(`start-call.${res.data.data.id}`).listen(
            "StartVideoCall",
            videoCallNotification
        );

        window.Echo.private("UpdateChatForUser." + res.data.data.id).listen(
            "ChatUpdate",
            UpdateChatForUser
        );
    });

    window.axios.get("/api/v1/permissions/my").then((res) => {
        const { can, rules } = new AbilityBuilder(Ability);
        can(res.data, "");
        ability.update(rules);
    });

    watch(
        () => userState.company?.id,
        () => {
            if (!userState.company.id) {
                return;
            }
            window.Echo.join(`user.${userState.company.id}`)
                .here((users: any) => {
                    userState.setOnlineUsers(users);
                })
                .joining((user: any) => {
                    userState.addOnlineUser(user);
                })
                .leaving((user: any) => {
                    userState.setOnlineUsers(
                        userState.onlineUsers.filter(
                            (obj) => obj.id !== user.id
                        )
                    );
                });
        },
        {
            immediate: true,
        }
    );

    // Update the page title based on message count
    const updatePageTitle = () => {
        if (userState.newMessages > 0) {
            document.title = `(${userState.newMessages}) ${userState.originalTitle}`;
        } else {
            document.title = userState.originalTitle;
        }
    };

    // Handle showing notifications safely
    const showNotification = (title, body, onClick, icon = '/logo.png', data = {}) => {
        // In PWA mode on GrapheneOS, we might want to show notifications even when focused
        // since the app might be running but not visible (e.g., split screen)
        const shouldShowNotification = !isWindowFocused.value || isPWA.value;
        
        if (!shouldShowNotification) {
            console.log('Window is focused and not in PWA mode, not showing browser notification');
            return;
        }

        // Check if notifications are supported
        if (!('Notification' in window)) {
            console.warn('This browser does not support desktop notifications');
            return;
        }

        // Try to show notification through service worker first (for PWA)
        if (navigator.serviceWorker) {
            try {
                // For better GrapheneOS compatibility, we'll try to ensure controller is available
                const getController = async () => {
                    if (navigator.serviceWorker.controller) {
                        return navigator.serviceWorker.controller;
                    }
                    
                    // If no controller, try to get registration
                    const reg = await navigator.serviceWorker.ready;
                    if (reg.active) {
                        // Force claim clients if needed
                        reg.active.postMessage({ type: 'claim-clients' });
                        
                        // Wait briefly for controller to be assigned
                        await new Promise(resolve => setTimeout(resolve, 50));
                        
                        return navigator.serviceWorker.controller;
                    }
                    return null;
                };
                
                const controller = await getController();
                
                if (controller) {
                    controller.postMessage({
                        type: 'notification',
                        notification: {
                            title,
                            body,
                            icon,
                            tag: 'notification-' + Date.now(), // Ensure unique tag for each notification
                            timestamp: Date.now(),
                            requireInteraction: true, // Keep notification until user dismisses it
                            renotify: true, // Notify each time even with same tag
                            url: data.url || '/',
                            ...data
                        }
                    });
                    console.log('Notification sent to service worker');
                    return;
                } else {
                    console.warn('No active service worker controller available');
                }
            } catch (error) {
                console.error('Error sending notification to service worker:', error);
                // Fall back to regular notification
            }
        }

        // Create direct browser notification if service worker approach failed
        if (notificationPermissionGranted.value) {
            try {
                const notification = new Notification(title, { 
                    body,
                    icon,
                    data,
                    badge: '/logo.png',
                    requireInteraction: true
                });
                notification.onclick = onClick;
                console.log('Direct browser notification shown');
            } catch (error) {
                console.error('Error creating notification:', error);
            }
        }
    };

    const UpdateChatForUser = (data: any) => {
        loadNumberOfUnreadMessages();

        // Only show notification if message wasn't sent by current user
        if (!data.message.is_self) {
            // Get user avatar if available
            const userAvatar = data.message.user_avatar || '/logo.png';
            
            showNotification(
                "New message",
                `${data.message.user} send you new message`,
                () => {
                    // Just focus the window
                    window.focus();
                },
                userAvatar, 
                {}
            );
        }
    };

    const pushNotificaiton = (data: any) => {
        // Get user avatar if available
        const userAvatar = data.callId.user.profile_photo_url || '/logo.png';
        
        showNotification(
            "Video call",
            `${data.callId.user.name} is calling you.`,
            (e) => {
                e.preventDefault();
                // Just focus the window
                window.focus();
            },
            userAvatar,
            {}
        );
    };

    const videoCallNotification = (data: any) => {
        toast(VideoToast, {
            data: {
                callerName: data.callId.user.name,
                callId: data.callId.videocalls.slug,
            },
            type: "info",
        });
        pushNotificaiton(data);
    };

    const loadNumberOfUnreadMessages = () => {
        window.axios
            .get("/api/v1/chats/number-of-unread-messages")
            .then((res) => {
                userState.setNewMessages(res.data);
                // Update page title after setting new messages
                updatePageTitle();

                res.data.messages.forEach((data: any) => {
                    messagesState.updateUnreadMessages(data);
                });
            });
    };

    // Request notification permission if not already granted
    const requestNotificationPermission = async () => {
        if (!('Notification' in window)) {
            console.warn('This browser does not support desktop notifications');
            return;
        }

        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            try {
                const permission = await Notification.requestPermission();
                notificationPermissionGranted.value = permission === 'granted';
                console.log('Notification permission:', permission);
            } catch (error) {
                console.error('Error requesting notification permission:', error);
            }
        }
    };

    // Request permission on initialization
    requestNotificationPermission();
    
    // Setup window focus/blur event listeners
    setupFocusListeners();

    // Watch for changes in message count to update title
    watch(
        () => userState.newMessages,
        () => {
            updatePageTitle();
        }
    );
    
    // Expose notification functions to window for use in other components
    if (typeof window !== 'undefined') {
        // Make notification functions globally available
        window.$notifications = {
            show: showNotification,
            isWindowFocused: () => isWindowFocused.value,
            requestPermission: requestNotificationPermission
        };
    }
};
