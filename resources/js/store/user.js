import { defineStore } from "pinia";
import { watch } from "vue";

export const useUserStore = defineStore("users", {
    state: () => ({
        user: {},
        company: {
            id: 0,
        },
        token: null,
        onlineUsers: [],
        mutedChats: [],
        newMessages: 0,
        showMessageOptions: null,
        originalTitle: document.title, // Store the original title
    }),
    actions: {
        setNewMessages(data) {
            this.newMessages = data.total;
            this.updatePageTitle();
        },
        subtractFromNewMessages(data) {
            this.newMessages = this.newMessages - data;
            this.updatePageTitle();
        },
        setUser(user) {
            this.user = user.data;
        },
        setMutedChats(chatIds) {
            this.mutedChats = chatIds.map(Number);
        },
        setChatMuted(chatId, muted) {
            const id = Number(chatId);
            this.mutedChats = muted
                ? [...new Set([...this.mutedChats, id])]
                : this.mutedChats.filter((obj) => obj !== id);
        },
        isChatMuted(chatId) {
            return this.mutedChats.includes(Number(chatId));
        },
        setOnlineUsers(users) {
            this.onlineUsers = users;
        },
        addOnlineUser(user) {
            this.onlineUsers.push(user);
        },
        setCompany(company) {
            this.company = company;
        },
        updatePageTitle() {
            // Update title only if there are new messages
            if (this.newMessages > 0) {
                document.title = `(${this.newMessages}) ${this.originalTitle}`;
            } else {
                document.title = this.originalTitle;
            }
        },
        // Initialize title tracking
        initTitleTracking() {
            // Save original title when store is created
            this.originalTitle = document.title;
            
            // Set up a watcher for newMessages
            watch(
                () => this.newMessages,
                (newCount) => {
                    this.updatePageTitle();
                }
            );
        }
    },
});
