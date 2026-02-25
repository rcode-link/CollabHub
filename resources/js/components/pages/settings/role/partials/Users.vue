<script setup lang="js">
import UserIcon from "@/components/shared/UserIcon.vue";
import AddUserToRoleModal from "@/components/pages/settings/role/partials/AddUserToRoleModal.vue";
import InteractiveToast from "@/components/shared/InteractiveToast.vue";
import { useRoleStore } from "@/store/roleStore";
import { toast } from "vue3-toastify";
import Button from "@/components/shared/Button.vue";
import Card from "@/components/shared/Card.vue";

const roleStore = useRoleStore();

const save = (id) => {
    let users = roleStore.role.users.find((obj) => obj.id);
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
    <Card>
        <div class="overflow-x-auto">
            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <h3 class="text-sm font-medium text-gray-900 dark:text-white">Users in role</h3>
                <AddUserToRoleModal />
            </div>
            <table class="w-full text-sm text-left" v-if="roleStore.role?.users?.length">
                <thead class="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 uppercase">
                    <tr>
                        <th class="px-4 py-3 w-12"></th>
                        <th class="px-4 py-3">Name</th>
                        <th class="px-4 py-3">Email</th>
                        <th class="px-4 py-3"></th>
                    </tr>
                </thead>
                <tbody class="text-gray-700 dark:text-gray-300">
                    <tr
                        v-for="obj in roleStore.role?.users"
                        :key="obj.id"
                        class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                        <td class="px-4 py-3">
                            <UserIcon :user="obj" />
                        </td>
                        <td class="px-4 py-3">
                            {{ obj.name }}
                        </td>
                        <td class="px-4 py-3">
                            {{ obj.email }}
                        </td>
                        <td class="px-4 py-3 text-right">
                            <InteractiveToast type="red">
                                <template #trigger>
                                    <Button variant="danger" size="sm">Remove</Button>
                                </template>
                                <template #title>Are you sure?</template>
                                <template #content>
                                    You are about to remove user
                                    <b>{{ obj.name }}</b> from role
                                    <b>{{ roleStore.role?.title }}</b>
                                </template>
                                <template #actions>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        @click="() => save(obj.id)"
                                    >
                                        Yes, remove
                                    </Button>
                                </template>
                            </InteractiveToast>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div v-else class="flex flex-col items-center justify-center py-16 text-center">
                <svg class="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">No users in this role</p>
            </div>
        </div>
    </Card>
</template>
