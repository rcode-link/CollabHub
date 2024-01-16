import {defineStore} from "pinia";
import {ref} from "vue";
import {useRoute} from "vue-router";
import {useBreadcrumbStore} from "./breadcrumb.js";
import {toast} from "vue3-toastify";

export const useSingleUserStore =
    defineStore('singleUserStore', () => {

        const route = useRoute();
        const loading = ref(true);
        const user = ref({
            name: '',
            manager: {
                id: null
            }
        });
//
        const breadcrumb = useBreadcrumbStore();
        const manager = ref();

        const load = () => {
            loading.value = true;
            axios.get(`/api/v1/users/${route.params.id}`).then(res => {
                user.value = res.data.data;
                if (!user.value.manager) {
                    user.value.manager = {
                        id: null
                    }
                }
                loading.value = false;
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
            axios
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
            axios
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
            axios
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
            axios.put(`/api/v1/users/${user.value.id}`, {
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
