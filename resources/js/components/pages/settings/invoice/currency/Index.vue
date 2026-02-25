<script setup lang="js">
import Settings from "@/components/layouts/Settings.vue";
import { onMounted, ref } from "vue";
import { useBreadcrumbStore } from "@/store/breadcrumb";
import Form from "@/components/pages/settings/invoice/currency/Form.vue";
import TableItem from "@/components/pages/settings/invoice/currency/partials/TableItem.vue";
import Card from "@/components/shared/Card.vue";

const breadcrumb = useBreadcrumbStore()
breadcrumb.setLinks([
    { link: '/', title: 'Home' },
    { link: { name: 'settings.base' }, title: 'Settings' },
    { title: 'Currency' },
])

const model = ref();

const load = () => {
    window.axios.get("/api/v1/currency").then((res) => {
        model.value = res.data.data;
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
                    <h3 class="text-sm font-medium text-gray-900 dark:text-white">Currencies</h3>
                    <Form @update="load" />
                </div>
                <table class="w-full text-sm text-left" v-if="model?.length">
                    <thead class="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 uppercase">
                        <tr>
                            <th class="px-4 py-3">Currency</th>
                            <th class="px-4 py-3">ISO</th>
                            <th class="px-4 py-3">Format</th>
                            <th class="px-4 py-3">Examples</th>
                            <th class="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody class="text-gray-700 dark:text-gray-300">
                        <TableItem
                            v-for="obj in model"
                            :key="obj.id"
                            :obj="obj"
                            @update="load"
                        />
                    </tbody>
                </table>
                <div v-else class="flex flex-col items-center justify-center py-16 text-center">
                    <p class="text-sm font-medium text-gray-500 dark:text-gray-400">No currencies configured</p>
                </div>
            </div>
        </Card>
    </Settings>
</template>
