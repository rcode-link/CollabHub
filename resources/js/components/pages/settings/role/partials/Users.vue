<script setup lang="js">
import {
    FwbButton,
    FwbTable,
    FwbTableBody,
    FwbTableCell,
    FwbTableHead,
    FwbTableHeadCell,
    FwbTableRow,
} from "flowbite-vue";
import UserIcon from "../../../../shared/UserIcon.vue";
import AddUserToRoleModal from "./AddUserToRoleModal.vue";
import InteractiveToast from "../../../../shared/InteractiveToast.vue";
import { useRoleStore } from "../../../../../store/roleStore";
import { toast } from "vue3-toastify";
const roleStore = useRoleStore();

const save = (id) => {
    let users = roleStore.role.users.find((obj: any) => obj.id);
    window.axios
        .put(`/api/v1/roles/detach/users/${roleStore.role.id}`, {
            user: id,
        })
        .then(() => {
            toast.success(
                `User ${users.name} removed from role ${roleStore.role.title}`,
                { theme: localStorage.getItem("color-theme") ?? "light" }
            );

            roleStore.loadRoleData();
        });
};
</script>

<template>
    <fwb-table hoverable class="w-full">
        <fwb-table-head>
            <fwb-table-head-cell></fwb-table-head-cell>
            <fwb-table-head-cell>Name</fwb-table-head-cell>
            <fwb-table-head-cell>Email</fwb-table-head-cell>
            <fwb-table-head-cell class="text-right">
                <AddUserToRoleModal />
            </fwb-table-head-cell>
        </fwb-table-head>
        <fwb-table-body>
            <fwb-table-row v-for="obj in roleStore.role?.users" :key="obj.id">
                <fwb-table-cell>
                    <UserIcon :user="obj" />
                </fwb-table-cell>

                <fwb-table-cell>
                    {{ obj.name }}
                </fwb-table-cell>
                <fwb-table-cell>
                    {{ obj.email }}
                </fwb-table-cell>
                <fwb-table-cell>
                    <interactive-toast type="red" class="text-left">
                        <template #trigger>
                            <fwb-button size="xs">Remove</fwb-button>
                        </template>
                        <template #title>
                            <h1 class="text-left">Are you sure?</h1>
                        </template>
                        <template #content>
                            <div class="text-left">
                                You are about to remove user
                                <b>{{ obj.name }}</b> from role
                                <b>{{ roleStore.role?.title }}</b>
                            </div>
                        </template>
                        <template #actions>
                            <fwb-button
                                color="red"
                                size="xs"
                                @click="() => save(obj.id)"
                                >Yes, remove it!</fwb-button
                            >
                        </template>
                    </interactive-toast>
                </fwb-table-cell>
            </fwb-table-row>
        </fwb-table-body>
    </fwb-table>
</template>

<style scoped></style>
