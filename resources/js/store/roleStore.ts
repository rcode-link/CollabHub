import { defineStore } from "pinia";

export const useRoleStore = defineStore("roleStore", {
    state: () => ({ roles: [] as any[], role: {}, activeRole: 0 }),
    actions: {
        setRoles(roles: any[]) {
            this.roles = roles;
        },
        setActiveRole(id: number) {
            this.activeRole = id;
        },
        loadRoles() {
            window.axios.get("/api/v1/roles").then((res) => {
                this.roles = res.data;
            });
        },
        loadRoleData() {
            window.axios.get(`/api/v1/roles/${this.activeRole}`).then((res) => {
                this.role = res.data;
            });
        },
    },
});
