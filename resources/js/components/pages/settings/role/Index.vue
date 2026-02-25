<script setup lang="js">
import { computed, ref, watch } from "vue";
import Settings from "@/components/layouts/Settings.vue";
import { useRoleStore } from "@/store/roleStore";
import Permissions from "@/components/pages/settings/role/partials/Permissions.vue";
import Users from "@/components/pages/settings/role/partials/Users.vue";
import { useBreadcrumbStore } from "@/store/breadcrumb";
import InteractiveToast from "@/components/shared/InteractiveToast.vue";
import Resource from "@/components/pages/settings/role/partials/Resource.vue";
import { toast } from "vue3-toastify";
import { useRoute } from "vue-router";
import Button from "@/components/shared/Button.vue";
import Text from "@/components/shared/Text.vue";
import Label from "@/components/shared/Label.vue";

const roleStore = useRoleStore();
const breadcrumb = useBreadcrumbStore();
const route = useRoute();
const activeTab = ref("users");
const roleName = ref("");
const deleteRoleToastRef = ref();

const tabs = [
    { key: "users", label: "Users" },
    { key: "permissions", label: "Permissions" },
    { key: "resources", label: "Resources" },
];

watch(
    () => route.query.role_id,
    () => {
        roleStore.activeRole = route.params.id ?? 0;
        roleStore.loadRoleData();
    },
    {
        deep: true,
        immediate: true,
    }
);
breadcrumb.setLinks([
    {
        link: "/",
        title: "Home",
    },
    {
        link: {
            name: "settings.base",
        },
        title: "Settings",
    },
    {
        title: "Roles",
    },
]);

watch(
    () => deleteRoleToastRef.value?.showToast,
    () => {
        roleName.value = "";
    },
    {
        deep: true,
        immediate: true,
    }
);

const shouldDeleteButtonBeDisabled = computed(() => {
    return roleName.value !== roleStore.role.title;
});

const deleteRole = () => {
    window.axios.delete(`/api/v1/roles/${roleStore.role.id}`).then(() => {
        toast.success(`Role ${roleStore.role.title} deleted`, {
            theme: localStorage.getItem("color-theme") ?? "light",
        });
        roleStore.loadRoles();
    });
};
</script>

<template>
    <Settings>
        <div class="w-full" :key="roleStore.role.title">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ roleStore.role.title }}</h2>
                <InteractiveToast
                    ref="deleteRoleToastRef"
                    type="red"
                    v-if="roleStore.role.can_be_changed"
                >
                    <template #trigger>
                        <Button variant="danger" size="sm">Delete role</Button>
                    </template>
                    <template #title>Are you sure?</template>
                    <template #content>
                        You are about to delete role
                        <b>{{ roleStore.role.title }}</b>!
                        All permissions that users have in this role will be lost.
                        <div class="mt-3">
                            <Label>To delete role type in its name:</Label>
                            <Text
                                v-model="roleName"
                                :placeholder="roleStore.role.title"
                            />
                        </div>
                    </template>
                    <template #actions>
                        <Button
                            :disabled="shouldDeleteButtonBeDisabled"
                            variant="danger"
                            size="sm"
                            @click="deleteRole"
                        >
                            Yes, delete it
                        </Button>
                    </template>
                </InteractiveToast>
            </div>
            <div class="flex gap-1 border-b border-gray-200 dark:border-gray-700 mb-5">
                <button
                    v-for="tab in tabs"
                    :key="tab.key"
                    @click="activeTab = tab.key"
                    class="px-4 py-2 text-sm font-medium rounded-t-lg transition-colors -mb-px border-b-2"
                    :class="
                        activeTab === tab.key
                            ? 'border-blue-600 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    "
                >
                    {{ tab.label }}
                </button>
            </div>
            <Users v-if="activeTab === 'users'" />
            <Permissions v-if="activeTab === 'permissions'" />
            <Resource v-if="activeTab === 'resources'" />
        </div>
    </Settings>
</template>
