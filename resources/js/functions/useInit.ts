import { useUserStore } from "../store/user.js";
import { initAxios } from "../axios.js";
import { Ability, AbilityBuilder } from "@casl/ability";
import ability from "./ability.js";
import { watch } from "vue";
import { initEcho } from "../bootstrap.js";
import { useTextToLinkStore } from "../store/textToLinkStore";
import { chatDetails } from "../store/chatStore.js";

import "../declaration.js";
import { toast } from "vue3-toastify";
import { useRouter } from "vue-router";
//@ts-ignore
import VideoToast from "../components/shared/video/VideoToast.vue";
export default () => {
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
    window.axios
        .get<
            any,
            {
                data: string[];
            }
        >("/api/v1/permissions/my")
        .then((res) => {
            const { can, rules } = new AbilityBuilder(Ability);
            can(res.data, "");
            ability.update(rules);
        });

    watch(
        () => userState.company.id,
        () => {
            if (!userState.company.id) {
                return;
            }
            window.Echo.join(`user.${userState.company.id}`)
                .here((users) => {
                    userState.setOnlineUsers(users);
                })
                .joining((user) => {
                    userState.addOnlineUser(user);
                })
                .leaving((user) => {
                    userState.setOnlineUsers(
                        userState.onlineUsers.filter(
                            (obj) => obj.id !== user.id
                        )
                    );
                })
                .error((error) => {
                    console.error(error);
                });
        },
        {
            immediate: true,
        }
    );

    const UpdateChatForUser = (data) => {
        loadNumberOfUnreadMessages();
        if (!document.hasFocus()) {
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

    const pushNotificaiton = (data) => {
        if (!document.hasFocus()) {
            const notification = new Notification("Video call", {
                body: `${data.callId.user.name} is calling you.`,
            });

            notification.onclick = (e) => {
                e.preventDefault();
                window.open(`/call/${data.callId.videocalls.slug}`);
            };
        }
    };

    const videoCallNotification = (data) => {
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
                res.data.messages.forEach((data) => {
                    messagesState.updateUnreadMessages(data);
                });
            });
    };
    Notification.requestPermission().then((r) => console.log(r));
};
