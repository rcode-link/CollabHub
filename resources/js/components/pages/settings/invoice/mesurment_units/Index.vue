<script setup lang="js">
import Settings from "@/components/layouts/Settings.vue";
import Text from "@/components/shared/Text.vue";
import Button from "@/components/shared/Button.vue";
import Card from "@/components/shared/Card.vue";
import { useBreadcrumbStore } from "@/store/breadcrumb";
import { onMounted, ref } from "vue";
import Form from "@/components/pages/settings/invoice/mesurment_units/Form.vue";

const breadcrumb = useBreadcrumbStore()
breadcrumb.setLinks([
    { link: '/', title: 'Home' },
    { link: { name: 'settings.base' }, title: 'Settings' },
    { title: 'Measurement Units' },
])

const model = ref({
    val: "",
});
const list = ref();
const load = () => {
    model.value = {
        val: "",
    };
    window.axios
        .get("/api/v1/invoice/data", {
            params: {
                type: "unit",
            },
        })
        .then((res) => {
            list.value = res.data;
        });
};

onMounted(() => {
    load();
});

const save = () => {
    window.axios
        .post("/api/v1/invoice/data", {
            type: "unit",
            data: model.value,
        })
        .then(() => load());
};
</script>
<template>
    <Settings>
        <Card>
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                    <thead class="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 uppercase">
                        <tr>
                            <th class="px-4 py-3">Name</th>
                            <th class="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody class="text-gray-700 dark:text-gray-300">
                        <Form
                            v-for="obj in list"
                            :key="obj.id"
                            :id="obj.id ?? 0"
                            :val="obj.data.val"
                            @update="load"
                        />
                        <tr class="border-b border-gray-100 dark:border-gray-800">
                            <td class="px-4 py-3">
                                <Text v-model="model.val" placeholder="New unit name" />
                            </td>
                            <td class="px-4 py-3 text-right">
                                <Button @click="save" size="sm">Save</Button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Card>
    </Settings>
</template>
