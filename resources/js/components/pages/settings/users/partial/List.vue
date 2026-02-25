<script setup>
import { useAbility } from "@casl/vue";
import { useBreadcrumbStore } from "@/store/breadcrumb";
import { useUserStore } from "@/store/user";
import { ref, watch } from "vue";
import UserIcon from "@/components/shared/UserIcon.vue";
import Card from "@/components/shared/Card.vue";

const { can } = useAbility();

const userState = useUserStore();
const response = ref({});

const breadcrumb = useBreadcrumbStore();

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
        link: {
            name: "settings.company",
        },
        title: "Company",
    },
    {
        link: {
            name: "settings.users",
        },
        title: "Users",
    },
    {
        title: "List",
    },
]);

watch(
    () => userState.company,
    () => {
        if (userState.company.id) {
            axios
                .get(`/api/v1/company/users/${userState.company.id}`)
                .then((res) => {
                    response.value = res.data;
                });
        }
    },
    {
        immediate: true,
        deep: true,
    }
);
</script>

<template>
    <Card>
        <div class="overflow-x-auto">
            <table class="w-full text-sm text-left" v-if="response.data?.length">
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
                        v-for="obj in response.data"
                        :key="obj.id + userState.onlineUsers"
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
                        <td class="px-4 py-3"></td>
                    </tr>
                </tbody>
            </table>
            <div v-else class="flex flex-col items-center justify-center py-16 text-center">
                <svg class="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">No users found</p>
            </div>
        </div>
    </Card>
</template>
