<script setup>
import InviteModal from "@/components/pages/settings/users/partial/InviteModal.vue";
import { useAbility } from "@casl/vue";

const { can } = useAbility();
import { useUserStore } from "@/store/user";
import { useBreadcrumbStore } from "@/store/breadcrumb";
import { onMounted, ref } from "vue";
import { DateTime } from "luxon";
import InteractiveToast from "@/components/shared/InteractiveToast.vue";
import Button from "@/components/shared/Button.vue";
import Card from "@/components/shared/Card.vue";

const userState = useUserStore();

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
        title: "Invite",
    },
]);

const response = ref({});
const data = () => {
    axios
        .get("/api/v1/company/invite")
        .then((res) => (response.value = res.data));
};
onMounted(() => {
    data();
});

const deleteRecord = ({ id }) => {
    axios.delete(`/api/v1/company/invite/${id}`).then(() => data());
};
</script>

<template>
    <Card>
        <div class="overflow-x-auto">
            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <h3 class="text-sm font-medium text-gray-900 dark:text-white">Invitation Links</h3>
                <InviteModal
                    v-if="can(`can-invite-users.${userState.company.id}`)"
                    @update:list="data"
                />
            </div>
            <table class="w-full text-sm text-left" v-if="response.data?.length">
                <thead class="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 uppercase">
                    <tr>
                        <th class="px-4 py-3">#</th>
                        <th class="px-4 py-3">Date</th>
                        <th class="px-4 py-3">Available / Used slots</th>
                        <th class="px-4 py-3"></th>
                    </tr>
                </thead>
                <tbody class="text-gray-700 dark:text-gray-300">
                    <tr
                        v-for="(obj, index) in response.data"
                        :key="obj.id"
                        class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                        <td class="px-4 py-3">
                            {{ index + 1 }}
                        </td>
                        <td class="px-4 py-3">
                            {{ DateTime.fromISO(obj.created_at).toLocaleString() }}
                        </td>
                        <td class="px-4 py-3">
                            {{ obj.number_of_invitations }} / {{ obj.registered_count }}
                        </td>
                        <td class="px-4 py-3 text-right">
                            <InteractiveToast type="red">
                                <template #trigger>
                                    <Button variant="danger" size="sm">Delete</Button>
                                </template>
                                <template #title>Are you sure?</template>
                                <template #content>
                                    You are about to delete invitation link #{{ index + 1 }}.
                                </template>
                                <template #actions>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        @click="() => deleteRecord(obj)"
                                    >
                                        Yes, delete it
                                    </Button>
                                </template>
                            </InteractiveToast>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div v-else class="flex flex-col items-center justify-center py-16 text-center">
                <svg class="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">No invitations yet</p>
            </div>
        </div>
    </Card>
</template>
