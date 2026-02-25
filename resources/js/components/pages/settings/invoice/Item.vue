<script lang="js" setup>
import { onMounted, ref } from "vue";
import Settings from "@/components/layouts/Settings.vue";
import { useBreadcrumbStore } from "@/store/breadcrumb";
import AddItem from "@/components/pages/settings/invoice/partials/AddItem.vue";
import InteractiveToast from "@/components/shared/InteractiveToast.vue";
import Button from "@/components/shared/Button.vue";
import Card from "@/components/shared/Card.vue";

const breadcrumb = useBreadcrumbStore()
breadcrumb.setLinks([
    { link: '/', title: 'Home' },
    { link: { name: 'settings.base' }, title: 'Settings' },
    { title: 'Invoice Items' },
])

const items = ref();

const load = () => {
    window.axios.get("/api/v1/billing-items").then((res) => {
        items.value = res.data.data;
    });
};

const deleteItem = (id) => {
    window.axios.delete(`/api/v1/billing-items/${id}`).then(() => {
        load();
    });
};

onMounted(() => {
    load();
});
</script>
<template>
    <Settings>
        <Card>
            <div class="overflow-x-auto">
                <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <h3 class="text-sm font-medium text-gray-900 dark:text-white">Billable Items</h3>
                    <AddItem @update="load" />
                </div>
                <table class="w-full text-sm text-left" v-if="items?.length">
                    <thead class="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 uppercase">
                        <tr>
                            <th class="px-4 py-3">Id</th>
                            <th class="px-4 py-3">Name</th>
                            <th class="px-4 py-3">Price</th>
                            <th class="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody class="text-gray-700 dark:text-gray-300">
                        <tr
                            v-for="obj in items"
                            :key="obj.id"
                            class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                            <td class="px-4 py-3">{{ obj.id }}</td>
                            <td class="px-4 py-3">{{ obj.name }}</td>
                            <td class="px-4 py-3">{{ obj.price }}</td>
                            <td class="px-4 py-3 text-right">
                                <InteractiveToast type="red">
                                    <template #title>Delete billing item</template>
                                    <template #content>
                                        Are you sure you want to delete
                                        <b>{{ obj.name }}</b>?
                                    </template>
                                    <template #trigger>
                                        <Button variant="danger" size="sm">Delete</Button>
                                    </template>
                                    <template #actions>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            @click="() => deleteItem(obj.id)"
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
                    <p class="text-sm font-medium text-gray-500 dark:text-gray-400">No billable items yet</p>
                </div>
            </div>
        </Card>
    </Settings>
</template>
