import { chatDetails } from "../store/chatStore.js";
import { toNumber } from "lodash";
import { useUserStore } from "../store/user.js";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

export default () => {
    const chatStore = chatDetails();
    const userStore = useUserStore();
    const page = ref(1);
    const route = useRoute();
    const router = useRouter();
    const chatId = ref(0);
    const listenForMessages = () => {
        window.Echo.leave(`chat.${chatId.value}`);
        window.Echo.join(`chat.${chatId.value}`)
            .listen("ChatMessageCreated", (data: any) => {
                setTimeout(() => {
                    chatStore.addMessage(data.message);
                    router.push({
                        query: route.query,
                        hash: `#message-${data.message.id}`,
                    });
                });
            })
            .listen("ChatMessageUpdated", (data: any) => {
                setTimeout(() => chatStore.updateMessage(data.data));
            })
            .listen("ChatMessageDeleted", (data: any) => {
                setTimeout(() => chatStore.deleteMessage(data));
            });
    };

    const loadMessages = () => {
        window.axios
            .get(`/api/v1/chats/${chatId.value}/messages?page=${page.value}`)
            .then((response) => {
                if (response.data.data.length > 0) {
                    router.push({
                        query: route.query,
                        hash: `#message-${response.data.data[0].id}`,
                    });
                    page.value = page.value + 1;
                }

                chatStore.addMessages(response.data.data);
                // progressBar.finish();
                const numOfUnread = chatStore.chatList.find(
                    (obj: any) => obj.id === toNumber(route.params.chatId)
                );

                console.log(numOfUnread);

                if (numOfUnread) {
                    userStore.subtractFromNewMessages(
                        numOfUnread.unreadMessages
                    );
                }

                chatStore.updateUnreadMessages({
                    id: route.params.chatId,
                    number_of_unread_messages_count: 0,
                });
            });
    };

    const resetMessages = () => chatStore.resetMessages();

    const scrolled = (e: any) => {
        // const { scrollTop, scrollHeight, offsetHeight } = e.currentTarget;
        // if (
        //     scrollTop === scrollHeight - offsetHeight &&
        //     chatStore.messages.length
        // ) {
        //     router.push({
        //         query: route.query,
        //         hash: `#message-${
        //             chatStore.messages[chatStore.messages.length - 1].id
        //         }`,
        //     });
        // }
        // if (scrollTop === 0) {
        //     loadMessages();
        // }
    };

    return {
        loadMessages,
        page,
        resetMessages,
        scrolled,
        chatId,
        listenForMessages,
    };
};
