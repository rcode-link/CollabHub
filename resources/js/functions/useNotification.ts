import { toast } from "vue3-toastify/index";
import useTabCoordination from "./useTabCoordination";

import VideoToast from "../components/shared/video/VideoToast.vue";
import { useRouter } from "vue-router";

export default () => {
    const tabCoordination = useTabCoordination();

    const router = useRouter();
    const shouldIShowNotification = () => {
        return tabCoordination.shouldINotifify();
    };
    const UpdateChatForUser = (data: any) => {
        if (shouldIShowNotification()) {
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
        if (shouldIShowNotification()) {
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
        toast(VideoToast, {
            data: {
                callerName: data.callId.user.name,
                callId: data.callId.videocalls.slug,
            },
            type: "info",
        });
        pushNotificaiton(data);
    };

    return {
        startNotificationListener,
    };
};
