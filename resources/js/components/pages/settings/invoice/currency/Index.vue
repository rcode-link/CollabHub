<script setup lang="js">
import {
    FwbTable,
    FwbTableBody,
    FwbTableHead,
    FwbTableHeadCell,
    FwbTableCell,
    FwbTableRow,
    FwbButton,
} from "flowbite-vue";
import Settings from "@/components/layouts/Settings.vue";
import { onMounted, ref } from "vue";
import Form from "./Form.vue";
import InteractiveToast from "@/components/shared/InteractiveToast.vue";
import TableItem from "./partials/TableItem.vue";

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
        <FwbTable class="w-full">
            <FwbTableHead>
                <FwbTableHeadCell>Currency</FwbTableHeadCell>
                <FwbTableHeadCell>ISO</FwbTableHeadCell>
                <FwbTableHeadCell>Format</FwbTableHeadCell>
                <FwbTableHeadCell>Examples</FwbTableHeadCell>
                <FwbTableHeadCell>
                    <Form @update="load" />
                </FwbTableHeadCell>
            </FwbTableHead>
            <FwbTableBody>
                <FwbTableRow v-for="obj in model">
                    <TableItem :obj="obj" @update="load" />
                </FwbTableRow>
            </FwbTableBody>
        </FwbTable>
    </Settings>
</template>
