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
export default () => {
    const userState = useUserStore();
    const messagesState = chatDetails();
    const router = useRouter();

    if (!localStorage.getItem("token")) {
        return;
    }

    const textToLinkStore = useTextToLinkStore();
    const notificationPermissionGranted = ref(Notification.permission === 'granted');

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
    const showNotification = (title, body, onClick) => {

        // Check if page is visible
        if (document.visibilityState === 'visible') {
            return;
        }

        // Check if notifications are supported
        if (!('Notification' in window)) {
            console.warn('This browser does not support desktop notifications');
            return;
        }

        // Create notification if permission granted
        if (notificationPermissionGranted.value) {
            try {
                const notification = new Notification(title, { body });
                notification.onclick = onClick;
            } catch (error) {
                console.error('Error creating notification:', error);
            }
        }
    };

    const UpdateChatForUser = (data: any) => {
        loadNumberOfUnreadMessages();

        showNotification(
            "New message",
            `${data.message.user} send you new message`,
            () => {
                router.push({
                    name: "chat-details",
                    params: {
                        chatId: data.chatId,
                    },
                });
                window.focus();
            }
        );
    };

    const pushNotificaiton = (data: any) => {
        showNotification(
            "Video call",
            `${data.callId.user.name} is calling you.`,
            (e) => {
                e.preventDefault();
                router.push(`/call/${data.callId.videocalls.slug}`);
                window.focus();
            }
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

    // Watch for changes in message count to update title
    watch(
        () => userState.newMessages,
        () => {
            updatePageTitle();
        }
    );
};
