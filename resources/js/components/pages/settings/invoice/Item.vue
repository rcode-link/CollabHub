<script lang="ts" setup>
import { onMounted, ref } from "vue";
import Settings from "../../../layouts/Settings.vue";
import {
    FwbButton,
    FwbTable,
    FwbTableBody,
    FwbTableCell,
    FwbTableHead,
    FwbTableHeadCell,
    FwbTableRow,
} from "flowbite-vue";
import { BillingItemResource } from "../../../../types";
import AddItem from "./partials/AddItem.vue";
import InteractiveToast from "../../../shared/InteractiveToast.vue";

const items = ref<BillingItemResource[]>();

const load = () => {
    window.axios.get("/api/v1/billing-items").then((res) => {
        items.value = res.data.data;
    });
};

const deleteItem = (id) => {
    window.axios.delete(`/api/v1/billing-items/${id}`).then((res) => {
        load();
    });
};

onMounted(() => {
    load();
});
</script>
<template>
    <Settings>
        <fwb-table hoverable class="w-full">
            <fwb-table-head>
                <fwb-table-head-cell>Id</fwb-table-head-cell>
                <fwb-table-head-cell>Name</fwb-table-head-cell>
                <fwb-table-head-cell>Price</fwb-table-head-cell>
                <fwb-table-head-cell class="flex justify-end">
                    <AddItem class="ml-auto" @update="load" />
                </fwb-table-head-cell>
            </fwb-table-head>
            <fwb-table-body>
                <fwb-table-row
                    v-for="obj in items"
                    class="cursor-pointer"
                    :key="obj.id"
                >
                    <fwb-table-cell>
                        {{ obj.id }}
                    </fwb-table-cell>
                    <fwb-table-cell>
                        {{ obj.name }}
                    </fwb-table-cell>
                    <fwb-table-cell>
                        {{ obj.price }}
                    </fwb-table-cell>
                    <fwb-table-cell>
                        <InteractiveToast>
                            <template #title>
                                You are about to delete billing item
                            </template>
                            <template #content>
                                Are you sure you want to delete
                                <b>{{ obj.name }}</b>
                                ?
                            </template>
                            <template #trigger>
                                <FwbButton size="xs" color="red">
                                    Delete
                                </FwbButton>
                            </template>
                            <template #actions>
                                <FwbButton
                                    size="xs"
                                    @click="() => deleteItem(obj.id)"
                                >
                                    Yes, Delete it!
                                </FwbButton>
                            </template>
                        </InteractiveToast>
                    </fwb-table-cell>
                </fwb-table-row>
            </fwb-table-body>
        </fwb-table>
    </Settings>
</template>
