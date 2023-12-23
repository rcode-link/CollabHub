import {defineStore} from "pinia";

export const useRoleStore = defineStore('roleStore', {
    state: () => ({roles: [], role: {}, activeRole: 0}),
    actions: {
        setRoles(roles) {
            this.roles = roles;
        },
        setActiveRole(id) {
            this.activeRole = id;
        },
        loadRoles() {
            axios.get('/api/v1/roles').then(res => {
                const prevRoles = this.roles.length;
                this.roles = res.data;

                if (res.data.length > 0 && prevRoles > 0) {
                    this.activeRole = res.data[res.data.length - 1].id;
                }

                if (res.data.length > 0 && prevRoles === 0) {
                    this.activeRole = res.data[0].id;
                }

            });
        },
        loadRoleData() {
            axios.get(`/api/v1/roles/${this.activeRole}`).then((res) => {
                this.role = res.data;
            })
        }

    },
})
