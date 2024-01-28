import { defineStore } from "pinia";
import { ref } from "vue";
import { useRoute } from "vue-router";
import { useBreadcrumbStore } from "./breadcrumb.js";
import { toast } from "vue3-toastify";
import { UserResource } from "../types/models/UserResource.js";
import "../declaration.js";

export interface iUser {
    id: number;
    name: string;
    email: string;
    avatar: string;
    start_work_time: string | null;
    end_work_time: string | null;
    deleted_at: string | null;
    manager: UserResource;
    view_profile?: string;
    availability: string;
}
export const useSingleUserStore = defineStore("singleUserStore", () => {
    const emptyUser: iUser = {
        id: 0,
        name: "",
        email: "",
        avatar: "",
        start_work_time: null,
        end_work_time: null,
        deleted_at: null,
        manager: {
            id: 0,
            name: "",
            email: "",
            avatar: "",
            start_work_time: null,
            end_work_time: null,
            deleted_at: null,
            view_profile: "",
            availability: "",
        },
        view_profile: "",
        availability: "",
    };
    const route = useRoute();
    const loading = ref<boolean>(true);
    const user = ref<iUser>(emptyUser);
    //
    const breadcrumb = useBreadcrumbStore();
    const manager = ref();

    const load = () => {
        loading.value = true;
        window.axios.get(`/api/v1/users/${route.params.id}`).then((res) => {
            user.value = res.data.data;
            loading.value = false;

            if (user.value.manager === null) {
                user.value.manager = emptyUser;
            }

            breadcrumb.setLinks([
                {
                    link: "/",
                    title: "Home",
                },
                {
                    link: "/",
                    title: "User",
                },
                {
                    title: user.value?.name,
                },
            ]);
        });
    };

    const deleteUser = () => {
        window.axios
            .delete(`/api/v1/users/${user.value?.id}`, {
                params: {
                    type: "delete",
                },
            })
            .then((res) => {
                user.value = res.data.data;
            })
            .then(() => {
                toast.success(`The user ${user.value?.name} is deleted`);
            });
    };
    const deactivateUser = () => {
        window.axios
            .delete(`/api/v1/users/${user.value?.id}`, {
                params: {
                    type: "deactivate",
                },
            })
            .then((res) => {
                user.value = res.data.data;
            })
            .then(() => {
                toast.success(`The user ${user.value?.name} is deactivated`);
            });
    };
    const restoreUser = () => {
        window.axios
            .delete(`/api/v1/users/${user.value?.id}`, {
                params: {
                    type: "restore",
                },
            })
            .then((res) => {
                user.value = res.data.data;
            })
            .then(() => {
                toast.success(`The user ${user.value?.name} is restored`);
            });
    };

    const updateManager = (manager) => {
        window.axios
            .put(`/api/v1/users/${user.value?.id}`, {
                manager_id: manager.id,
            })
            .then(() => {
                toast.success(`Manager for user ${user.value?.name} updated`);
            });
    };

    return {
        load,
        deleteUser,
        deactivateUser,
        updateManager,
        restoreUser,
        user,
        manager,
        loading,
    };
});
