import { chatDetails } from "../store/chatStore.js";
import { toNumber } from "lodash";
import { useUserStore } from "../store/user.js";
import { ref, nextTick, onUpdated } from "vue";
import { useRoute, useRouter } from "vue-router";

export default () => {
    const chatStore = chatDetails();
    const userStore = useUserStore();
    const page = ref(0);
    const route = useRoute();
    const router = useRouter();
    const chatId = ref(0);
    const scrollToLastMessage = ref(false);
    const showScrollToBottom = ref(0);
    const lastMessageId = ref(null)
    const scrollMessageToView = (targetId) => {
        const targetElement = document.getElementById(`message-${targetId}`);

        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
        showScrollToBottom.value = 0;
        lastMessageId.value = null;

    }
    const listenForMessages = () => {

        window.Echo.leave(`chat.${chatId.value}`);
        window.Echo.join(`chat.${chatId.value}`)
            .listen("ChatMessageCreated", async (data: any) => {
                chatStore.addMessage(data.message);
                lastMessageId.value = data.message.id;
                await nextTick();
                if (scrollToLastMessage.value) {

                    scrollMessageToView(data.message.id);
                }
                showScrollToBottom.value = 1;
            })
            .listen("ChatMessageUpdated", (data: any) => {
                setTimeout(() => chatStore.updateMessage(data.data));
            })
            .listen("ChatMessageDeleted", (data: any) => {
                setTimeout(() => chatStore.deleteMessage(data));
            });
    };

    const loadMessages = () => {
        console.trace("hello")
        page.value += 1;
        window.axios
            .get(`/api/v1/chats/${chatId.value}/messages?page=${page.value}`)
            .then((response) => {

                const items = response.data.data;
                chatStore.addMessages(items);
                //progressBar.finish();
                const numOfUnread = chatStore.chatList.find(
                    (obj: any) => obj.id === toNumber(route.params.chatId)
                );


                if (numOfUnread) {
                    userStore.subtractFromNewMessages(
                        numOfUnread.unreadMessages
                    );
                }

                chatStore.updateUnreadMessages({
                    id: route.params.chatId,
                    number_of_unread_messages_count: 0,
                });

                return items[items.length - 1];
            }).then(res => scrollMessageToView(res.id));
    };

    const resetMessages = () => {
        page.value = 0;
        chatStore.resetMessages()
    };

    const scrolled = (e: any) => {
        const { scrollTop, scrollHeight, offsetHeight } = e.currentTarget;
        scrollToLastMessage.value = false;

        const bottom = scrollHeight - offsetHeight - scrollTop;

        if (bottom < 25) {
            scrollToLastMessage.value = true;
            showScrollToBottom.value = 0;
        }
        if (scrollTop === 0) {
            loadMessages();
        }
    };

    const scrollToBottom = () => {
        showScrollToBottom.value = 0;
        scrollToLastMessage.value = true;
        scrollMessageToView(chatStore.messages[chatStore.messages.length - 1].id);
    }

    return {
        showScrollToBottom,
        scrollToBottom,
        loadMessages,
        page,
        resetMessages,
        scrolled,
        chatId,
        listenForMessages,
        lastMessageId
    };
};
