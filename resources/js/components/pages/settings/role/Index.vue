<script setup lang="js">
import { computed, onMounted, ref, watch } from "vue";
import Settings from "../../../layouts/Settings.vue";
import { useRoleStore } from "../../../../store/roleStore";
import Permissions from "./partials/Permissions.vue";
import { FwbButton, FwbInput, FwbTab, FwbTabs } from "flowbite-vue";
import Users from "./partials/Users.vue";
import { useBreadcrumbStore } from "../../../../store/breadcrumb";
import InteractiveToast from "../../../shared/InteractiveToast.vue";
import Resource from "./partials/Resource.vue";
import { toast } from "vue3-toastify";
import { useRoute } from "vue-router";

const roleStore = useRoleStore();
const breadcrumb = useBreadcrumbStore();
const route = useRoute();
const activeTab = ref("users");
const roleName = ref("");
const deleteRoleToastRef = ref();

watch(
    () => route.query.role_id,
    () => {
        roleStore.activeRole = (route.params.id as number) ?? 0;
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
            <div class="flex justify-between items-center">
                <h1 class="base-item text-lg">{{ roleStore.role.title }}</h1>
                <interactive-toast
                    ref="deleteRoleToastRef"
                    v-if="roleStore.role.can_be_changed"
                >
                    <template #trigger>
                        <fwb-button color="red">Delete role</fwb-button>
                    </template>
                    <template #title>
                        <h1>Are sure?</h1>
                    </template>
                    <template #content>
                        You are about to delete role
                        <b>{{ roleStore.role.title }}</b
                        >! All permissions that users have in this role will be
                        lost!!!
                        <br />

                        <fwb-input
                            v-model="roleName"
                            label="To delete role type in its name:"
                            :placeholder="roleStore.role.title"
                            size="sm"
                        />
                    </template>
                    <template #actions>
                        <fwb-button
                            :disabled="shouldDeleteButtonBeDisabled"
                            size="xs"
                            color="red"
                            @click="deleteRole"
                        >
                            Yes delete it!
                        </fwb-button>
                    </template>
                </interactive-toast>
            </div>
            <fwb-tabs v-model="activeTab" variant="underline" class="pt-5">
                <fwb-tab name="users" title="Users">
                    <users />
                </fwb-tab>
                <fwb-tab name="permissions" title="Permissisons">
                    <Permissions />
                </fwb-tab>
                <fwb-tab name="resources" title="Resources">
                    <Resource />
                </fwb-tab>
            </fwb-tabs>
        </div>
    </Settings>
</template>

<style scoped></style>
