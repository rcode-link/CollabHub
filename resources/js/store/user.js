import { defineStore } from "pinia";

export const useUserStore = defineStore("users", {
    state: () => ({
        user: {},
        company: {},
        token: null,
        onlineUsers: [],
        newMessages: 0,
        showMessageOptions: null,
    }),
    actions: {
        setNewMessages(data) {
            this.newMessages = data.total;
        },
        subtractFromNewMessages(data) {
            this.newMessages = this.newMessages - data;
        },
        setUser(user) {
            this.user = user.data;
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
    },
});
