import { toast } from "vue3-toastify/index";
import useTabCoordination from "./useTabCoordination";
import { useUserStore } from "../store/user";

import VideoToast from "../components/shared/video/VideoToast.vue";
import { useRouter } from "vue-router";

export default () => {
    const tabCoordination = useTabCoordination();

    const router = useRouter();
    const shouldIShowNotification = () => {
        return tabCoordination.shouldINotifify();
    };
    const UpdateChatForUser = (data: any) => {
        // Get the user store to access current user ID
        const userStore = useUserStore();
        
        // Since the ChatUpdate event doesn't contain the user_id directly in data,
        // we need to look for it in the chat controller or get it from other user info
        // We'll use the sender's name to decide if it's the current user
        
        // Only show notification if:
        // 1. User should be notified (user is not on the page)
        // 2. The sender is not the current user (comparing by name since ID is not directly available)
        const isCurrentUserSender = userStore.user.name === data.message.user;
        
        if (shouldIShowNotification() && !isCurrentUserSender) {
            const notification = new Notification("New message", {
                body: `${data.message.user} send you new message`,
            });
            notification.onclick = () => {
                router.push({
                    name: "chat-details",
                    params: {
                        chatId: data.chatId,
                    },
                });
            };
        }
    };

    const startNotificationListener = (userId: number) => {
        window.Echo.private(`start-call.${userId}`).listen(
            "StartVideoCall",
            videoCallNotification
        );

        window.Echo.private("UpdateChatForUser." + userId).listen(
            "ChatUpdate",
            UpdateChatForUser
        );
    };

    const pushNotificaiton = (data: any) => {
        // Get the user store to access current user ID
        const userStore = useUserStore();
        
        // Only show notification if:
        // 1. User should be notified (user is not on the page)
        // 2. The caller is not the current user
        const callerId = data.callId.user.id;
        const isCurrentUserCaller = callerId === userStore.user.id;
        
        if (shouldIShowNotification() && !isCurrentUserCaller) {
            const notification = new Notification("Video call", {
                body: `${data.callId.user.name} is calling you.`,
            });

            notification.onclick = (e) => {
                e.preventDefault();
                window.open(`/call/${data.callId.videocalls.slug}`);
            };
        }
    };

    const videoCallNotification = (data: any) => {
        // Get the user store to access current user ID
        const userStore = useUserStore();
        
        // Check if the caller is not the current user
        const callerId = data.callId.user.id;
        const isCurrentUserCaller = callerId === userStore.user.id;
        
        if (!isCurrentUserCaller) {
            toast(VideoToast, {
                data: {
                    callerName: data.callId.user.name,
                    callId: data.callId.videocalls.slug,
                },
                type: "info",
            });
            pushNotificaiton(data);
        }
    };

    return {
        startNotificationListener,
    };
};
