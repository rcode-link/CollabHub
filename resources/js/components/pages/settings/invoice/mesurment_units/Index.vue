<script setup lang="ts">
import Settings from "@/components/layouts/Settings.vue";
import Text from "@/components/shared/Text.vue";
import { iData, iInvoiceData } from "@/functions/invoiceDataInterface";
import {
    FwbButton,
    FwbTable,
    FwbTableBody,
    FwbTableCell,
    FwbTableHead,
    FwbTableHeadCell,
    FwbTableRow,
} from "flowbite-vue";
import { onMounted, ref } from "vue";
import Form from "./Form.vue";
const model = ref<iData>({
    val: "",
});
const list = ref<iInvoiceData[]>();
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
        <FwbTable>
            <FwbTableHead>
                <FwbTableHeadCell>Name</FwbTableHeadCell>
                <FwbTableHeadCell></FwbTableHeadCell>
            </FwbTableHead>
            <FwbTableBody>
                <Form
                    v-for="obj in list"
                    :id="obj.id ?? 0"
                    :val="obj.data.val"
                    @update="load"
                />
                <FwbTableRow>
                    <FwbTableCell> <Text v-model="model.val" /> </FwbTableCell>
                    <FwbTableCell>
                        <FwbButton @click="save">Save</FwbButton>
                    </FwbTableCell>
                </FwbTableRow>
            </FwbTableBody>
        </FwbTable>
    </Settings>
</template>
