import { defineStore } from "pinia";
import { ref } from "vue";
import { useRoute } from "vue-router";
import { useBreadcrumbStore } from "./breadcrumb.js";
import { toast } from "vue3-toastify";
import { UserResource } from "../types/models/UserResource.js";

export const useSingleUserStore =
    defineStore('singleUserStore', () => {

        const route = useRoute();
        const loading = ref<boolean>(true);
        const user = ref<UserResource>();
        //
        const breadcrumb = useBreadcrumbStore();
        const manager = ref();

        const load = () => {
            loading.value = true;
            window.axios.get(`/api/v1/users/${route.params.id}`).then(res => {
                user.value = res.data.data;
                loading.value = false;
                if (!user.value.manager) {
                    user.value.manager = {
                        id: null
                    } as UserResource
                }
                breadcrumb.setLinks([
                    {
                        link: '/',
                        title: 'Home'
                    },
                    {
                        link: '/',
                        title: 'User'
                    },
                    {
                        title: user.value.name
                    }

                ])
            });
        }

        const deleteUser = () => {
            window.axios
                .delete(`/api/v1/users/${user.value.id}`, {
                    params: {
                        type: 'delete'
                    }
                })
                .then(res => {
                    user.value = res.data.data;
                })
                .then(() => {
                    toast.success(`The user ${user.value.name} is deleted`);
                })
        }
        const deactivateUser = () => {
            window.axios
                .delete(`/api/v1/users/${user.value.id}`, {
                    params: {
                        type: 'deactivate'
                    }
                })
                .then(res => {
                    user.value = res.data.data;
                })
                .then(() => {
                    toast.success(`The user ${user.value.name} is deactivated`);
                })
        }
        const restoreUser = () => {
            window.axios
                .delete(`/api/v1/users/${user.value.id}`, {
                    params: {
                        type: 'restore'
                    }
                })
                .then(res => {
                    user.value = res.data.data;
                })
                .then(() => {
                    toast.success(`The user ${user.value.name} is restored`);
                })
        }

        const updateManager = (manager) => {
            window.axios.put(`/api/v1/users/${user.value.id}`, {
                'manager_id': manager.id
            }).then(res => {
                user.value = res.data.data;
            }).then(() => {
                toast.success(`Manager for user ${user.value.name} updated`)
            })
        }

        return {
            load,
            deleteUser,
            deactivateUser,
            updateManager,
            restoreUser,
            user,
            manager,
            loading
        }
    });