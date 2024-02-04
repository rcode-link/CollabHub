<script lang="ts" setup>
import { InvoiceItemResource } from "@/types";
import { FwbTableCell, FwbTableRow, FwbButton } from "flowbite-vue";
import Text from "@/components/shared/Text.vue";
import TrashIcon from "@/components/shared/icons/TrashIcon.vue";
import currencyPrint from "@/functions/currencyPrint";
import { debounce } from "lodash";
interface iProps {
    item: InvoiceItemResource;
    index: string;
    currency: any;
}
const props = defineProps<iProps>();
const updateItem = debounce(async () => {
    await window.axios.put(
        `/api/v1/invoices-items/${props.item.id}`,
        props.item
    );
}, 350);

const deleteItem = async () => {
    await window.axios.delete(`/api/v1/invoices-items/${props.item.id}`);
};
</script>
<template>
    <fwb-table-row :key="index">
        <fwb-table-cell>{{ Number(index) + 1 }}</fwb-table-cell>
        <fwb-table-cell>{{ item.name ?? "" }}</fwb-table-cell>
        <fwb-table-cell>
            <Text v-model="item.price" type="number" @blur="updateItem" />
        </fwb-table-cell>
        <fwb-table-cell>
            <Text v-model="item.qty" type="number" @blur="updateItem" />
        </fwb-table-cell>
        <fwb-table-cell></fwb-table-cell>
        <fwb-table-cell>
            {{ currencyPrint(Number(item.total), currency) }}
        </fwb-table-cell>
        <fwb-table-cell>
            <fwb-button @click="deleteItem" color="red" size="xs">
                <TrashIcon class="w-4 h-4" />
            </fwb-button>
        </fwb-table-cell>
    </fwb-table-row>
</template>
