import { defineStore } from "pinia";
import { ref } from "vue";
import { useRoute } from "vue-router";
import { useBreadcrumbStore } from "./breadcrumb.js";
import { toast } from "vue3-toastify";

export const useSingleUserStore = defineStore("singleUserStore", () => {
    const emptyUser = {
        id: 0,
        name: "",
        email: "",
        avatar: "",
        start_work_time: null,
        end_work_time: null,
        deleted_at: null,
        manager: {},
        view_profile: "",
        availability: "",
    };
    const breadcrumb = useBreadcrumbStore(); // Initialize the breadcrumb store
    const route = useRoute();
    const loading = ref(true);
    const user = ref(structuredClone(emptyUser));  // Create a deep copy of emptyUser
    const manager = ref();

    function sanitizeUser(userData) {
        return {
            id: userData.id || 0,
            name: userData.name || "",
            email: userData.email || "",
            avatar: userData.avatar || "",
            start_work_time: userData.start_work_time || null,
            end_work_time: userData.end_work_time || null,
            deleted_at: userData.deleted_at || null,
            manager: userData.manager ? sanitizeUser(userData.manager): {},
            view_profile: Array.isArray(userData.view_profile) ? userData.view_profile : [],
            availability: Array.isArray(userData.availability) ? userData.availability : [],
        };
    }

    const load = () => {
        loading.value = true;
        window.axios.get(`/api/v1/users/${route.params.id}`).then((res) => {
            user.value = sanitizeUser(res.data.data);
            loading.value = false;

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
