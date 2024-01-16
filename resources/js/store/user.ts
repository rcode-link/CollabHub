import { defineStore } from "pinia";
import { Company, UserResource } from "../types";

export const useUserStore = defineStore('users', {
    state: () => ({ user: {} as UserResource, company: {} as Company, token: null as string | null, onlineUsers: [] as UserResource[], newMessages: 0 as number }),
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
})
