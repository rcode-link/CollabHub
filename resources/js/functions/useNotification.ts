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
        
        // Only show notification if:
        // 1. User should be notified (user is not on the page)
        // 2. The sender is not the current user (comparing by name since ID is not directly available)
        const isCurrentUserSender = userStore.user.name === data.message.user;
        
        if (shouldIShowNotification() && !isCurrentUserSender) {
            toast.info(`${data.message.user} sent you a new message`, {
                onClick: () => {
                    router.push({
                        name: "chat-details",
                        params: {
                            chatId: data.chatId,
                        },
                    });
                }
            });
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
        }
    };

    return {
        startNotificationListener,
    };
};