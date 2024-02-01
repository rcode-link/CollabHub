<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { InvoiceResource } from "@/types";
import { Pagination } from "@/interfaces";
import InvoiceForm from "./Form.vue";
import {
    FwbTable,
    FwbTableHead,
    FwbTableBody,
    FwbTableCell,
    FwbTableRow,
    FwbTableHeadCell,
} from "flowbite-vue";
import { DateTime } from "luxon";
interface iResource extends Pagination {
    data: InvoiceResource[];
}

const route = useRoute();

const invoices = ref<iResource>();
const load = () => {
    window.axios
        .get("/api/v1/invoices", {
            params: {
                company_id: route.params.id,
            },
        })
        .then((res) => (invoices.value = res.data));
};

onMounted(() => {
    load();
});
</script>
<template>
    <fwb-table class="" hoverable>
        <fwb-table-head>
            <fwb-table-head-cell>No.</fwb-table-head-cell>
            <fwb-table-head-cell>Total</fwb-table-head-cell>
            <fwb-table-head-cell>Is sent</fwb-table-head-cell>
            <fwb-table-head-cell>Date</fwb-table-head-cell>
            <fwb-table-head-cell>Due date</fwb-table-head-cell>
            <fwb-table-head-cell class="flex">
                <InvoiceForm
                    v-if="invoices?.data != undefined"
                    :numberOfInvoices="invoices?.data.length"
                />
                <!-- <Form @update="load" /> -->
            </fwb-table-head-cell>
        </fwb-table-head>
        <fwb-table-body>
            <fwb-table-row
                v-for="obj in invoices?.data"
                class="cursor-pointer"
                :key="obj.id"
            >
                <fwb-table-cell>
                    {{ obj.number }}
                </fwb-table-cell>
                <fwb-table-cell>
                    {{ obj.total }}
                </fwb-table-cell>
                <fwb-table-cell>
                    {{ obj.sent ? "Sent" : "Not sent" }}
                </fwb-table-cell>
                <fwb-table-cell>
                    {{ DateTime.fromSQL(obj.date).toLocaleString() }}
                </fwb-table-cell>
                <fwb-table-cell>
                    {{ DateTime.fromSQL(obj.due_date).toLocaleString() }}
                </fwb-table-cell>
                <fwb-table-cell>
                    <router-link
                        :to="{
                            name: 'invoices.form',
                            params: {
                                inv_id: obj.id,
                            },
                        }"
                        >Open</router-link
                    >
                </fwb-table-cell>
            </fwb-table-row>
        </fwb-table-body>
    </fwb-table>
</template>
