<script lang="ts" setup>
import { InvoiceItemResource } from "@/types";
import { FwbTableCell, FwbTableRow, FwbButton } from "flowbite-vue";
import Text from "@/components/shared/Text.vue";
import { ref, watch } from "vue";
import TrashIcon from "@/components/shared/icons/TrashIcon.vue";
interface iProps {
    item: InvoiceItemResource;
    index: string;
}
// props: ["item", "index"],
const props = defineProps<iProps>();
const timeOut = ref();
watch(
    props.item,
    () => {
        clearTimeout(timeOut.value);

        timeOut.value = setTimeout(async () => {
            await window.axios.put(
                `/api/v1/invoices-items/${props.item.id}`,
                props.item
            );
        }, 450);
    },
    {
        deep: true,
    }
);

const deleteItem = async () => {
    await window.axios.delete(`/api/v1/invoices-items/${props.item.id}`);
};
</script>
<template>
    <fwb-table-row :key="index">
        <fwb-table-cell>{{ index + 1 }}</fwb-table-cell>
        <fwb-table-cell>{{ item.name ?? "" }}</fwb-table-cell>
        <fwb-table-cell
            ><Text v-model="item.price" type="number"
        /></fwb-table-cell>
        <fwb-table-cell
            ><Text v-model="item.qty" type="number"
        /></fwb-table-cell>
        <fwb-table-cell></fwb-table-cell>
        <fwb-table-cell>
            {{
                item.total.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                })
            }}
        </fwb-table-cell>
        <fwb-table-cell>
            <fwb-button @click="deleteItem" color="red" size="xs">
                <TrashIcon class="w-4 h-4" />
            </fwb-button>
        </fwb-table-cell>
    </fwb-table-row>
</template>
