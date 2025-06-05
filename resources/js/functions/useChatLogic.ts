import { chatDetails } from "../store/chatStore.js";
import { toNumber } from "lodash";
import { useUserStore } from "../store/user.js";
import { ref, nextTick } from "vue";
import { useRoute } from "vue-router";
import * as _ from "lodash";


export default (chatIdParam, messageContainerRef) => {
    const chatStore = chatDetails();
    const userStore = useUserStore();
    const maxPage = ref(0);
    const page = ref(0);
    const route = useRoute();
    const chatId = ref(0);
    const scrollToLastMessage = ref(false);
    const showScrollToBottom = ref(0);
    const lastMessageId = ref(null)

    const listenForMessages = () => {

        window.Echo.leave(`chat.${chatId.value}`);
        window.Echo.join(`chat.${chatId.value}`)
            .listen("ChatMessageCreated", async (data: any) => {
                chatStore.addMessage(data.message);
                lastMessageId.value = data.message.id;
                await nextTick();
                if (scrollToLastMessage.value) {
                    scrollToBottom()
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
        page.value += 1;

        if (maxPage.value != 0 && page.value > maxPage.value) {
            return;
        }


        const scrollHeightBefore = messageContainerRef.value && messageContainerRef.value.scrollHeight;
        window.axios
            .get(`/api/v1/chats/${chatId.value}/messages?page=${page.value}`)
            .then((response) => {
                const items = response.data.data.reverse();

                maxPage.value = response.data.meta.last_page;
                chatStore.addMessages(items);
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
                try {
                    return items[items.length - 1];
                } catch (error) {
                    return null;
                }
            }).then(res => {
                if (!res) {
                    return;
                }
                nextTick(() => {
                    if (page.value === 1) {
                        scrollToBottom()
                        return;
                    }
                    const scrollHeightAfter = messageContainerRef.value.scrollHeight;
                    messageContainerRef.value.scrollTop = scrollHeightAfter - scrollHeightBefore;
                });
            });
    };

    const resetMessages = () => {
        page.value = 0;
        chatStore.resetMessages()
    };

    const scrolled = (e: any) => {
        const { scrollTop, scrollHeight, offsetHeight } = messageContainerRef.value;
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
        messageContainerRef.value.scrollTop = messageContainerRef.value.scrollHeight
    }

    return {
        showScrollToBottom,
        scrollToLastMessage,
        scrollToBottom,
        loadMessages,
        page,
        resetMessages,
        scrolled,
        chatId,
        listenForMessages,
        lastMessageId,
        messageContainerRef
    };
};
