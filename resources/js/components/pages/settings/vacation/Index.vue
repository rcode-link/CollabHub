<script setup lang="js">
import Settings from "@/components/layouts/Settings.vue";
import { onMounted } from "vue";
import { useBreadcrumbStore } from "@/store/breadcrumb";
import { useVacationGroupStore } from "@/store/vacationGroupStore";
import Card from "@/components/shared/Card.vue";
import Button from "@/components/shared/Button.vue";
import Form from "@/components/pages/settings/vacation/Form.vue";
import Allocations from "@/components/pages/settings/vacation/partials/Allocations.vue";
import InteractiveToast from "@/components/shared/InteractiveToast.vue";

const breadcrumb = useBreadcrumbStore();
breadcrumb.setLinks([
    { link: "/", title: "Home" },
    { link: { name: "settings.base" }, title: "Settings" },
    { title: "Vacation Groups" },
]);

const store = useVacationGroupStore();

onMounted(() => {
    store.loadGroups();
});
</script>
<template>
    <Settings>
        <Card>
            <div class="overflow-x-auto">
                <div
                    class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800"
                >
                    <h3
                        class="text-sm font-medium text-gray-900 dark:text-white"
                    >
                        Vacation Groups
                    </h3>
                    <Form @update="store.loadGroups" />
                </div>
                <table
                    class="w-full text-sm text-left"
                    v-if="store.groups?.length"
                >
                    <thead
                        class="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 uppercase"
                    >
                        <tr>
                            <th class="px-4 py-3">Name</th>
                            <th class="px-4 py-3">Days / Year</th>
                            <th class="px-4 py-3">Period</th>
                            <th class="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody class="text-gray-700 dark:text-gray-300">
                        <tr
                            v-for="group in store.groups"
                            :key="group.id"
                            class="border-b border-gray-100 dark:border-gray-800"
                        >
                            <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                {{ group.name }}
                            </td>
                            <td class="px-4 py-3">{{ group.days_per_year }}</td>
                            <td class="px-4 py-3">
                                {{ group.period_start }} — {{ group.period_end }}
                            </td>
                            <td class="px-4 py-3">
                                <div class="flex items-center justify-end gap-2">
                                    <Allocations :group="group" />
                                    <Form
                                        :group="group"
                                        @update="store.loadGroups"
                                    />
                                    <InteractiveToast>
                                        <template #trigger>
                                            <Button size="sm" color="red">
                                                Delete
                                            </Button>
                                        </template>
                                        <template #title>
                                            Delete vacation group
                                        </template>
                                        <template #content>
                                            Are you sure you want to delete
                                            "{{ group.name }}"?
                                        </template>
                                        <template #actions>
                                            <Button
                                                color="red"
                                                size="xs"
                                                @click="
                                                    store.deleteGroup(group.id)
                                                "
                                            >
                                                Yes, Delete it
                                            </Button>
                                        </template>
                                    </InteractiveToast>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div
                    v-else
                    class="flex flex-col items-center justify-center py-16 text-center"
                >
                    <p
                        class="text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                        No vacation groups configured
                    </p>
                </div>
            </div>
        </Card>
    </Settings>
</template>
