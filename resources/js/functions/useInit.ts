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
import useTabCoordination from "./useTabCoordination.js";
export default () => {
    const tabCoordination = useTabCoordination();
    const userState = useUserStore();
    const messagesState = chatDetails();
    const router = useRouter();
    if (!localStorage.getItem("token")) {
        return;
    }
    const textToLinkStore = useTextToLinkStore();

    initEcho();
    initAxios();
    textToLinkStore.load();
    const shouldIShowNotification = () => {
        return tabCoordination.shouldINotifify();
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

    const UpdateChatForUser = (data: any) => {
        loadNumberOfUnreadMessages();

        if(document.visibilityState === 'visible'){
            return;
        }
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
    };

    const pushNotificaiton = (data: any) => {
if(document.visibilityState === 'visible'){
            return;
        }
            const notification = new Notification("Video call", {
                body: `${data.callId.user.name} is calling you.`,
            });

            notification.onclick = (e) => {
                e.preventDefault();
                router.push(`/call/${data.callId.videocalls.slug}`);
            };
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
                res.data.messages.forEach((data: any) => {
                    messagesState.updateUnreadMessages(data);
                });
            });
    };
    Notification.requestPermission().then((r) => console.log(r));
};
