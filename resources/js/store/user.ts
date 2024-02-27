import { defineStore } from "pinia";
import { Company, UserResource } from "../types";

export const useUserStore = defineStore("users", {
    state: () => ({
        user: {} as UserResource,
        company: {} as Company,
        token: null as string | null,
        onlineUsers: [] as UserResource[],
        newMessages: 0 as number,
    }),
    actions: {
        setNewMessages(data: any) {
            this.newMessages = data.total;
        },
        subtractFromNewMessages(data: any) {
            this.newMessages = this.newMessages - data;
        },
        setUser(user: any) {
            this.user = user.data as UserResource;
        },
        setOnlineUsers(users: UserResource[]) {
            this.onlineUsers = users;
        },
        addOnlineUser(user: UserResource) {
            this.onlineUsers.push(user);
        },
        setCompany(company: Company) {
            this.company = company;
        },
    },
});
