<script lang="js" setup>
import { onMounted } from "vue";
import useInvoice from "@/components/pages/invoices/details/functions/useInvoice";
import InvoiceForm from "./Form.vue";
import { toast } from "vue3-toastify";
import currencyPrint from "@/functions/currencyPrint";
import InteractiveToast from "@/components/shared/InteractiveToast.vue";

import { useInvoiceDetailsStore } from "@/store/invoiceDetailsStore";
import {
    FwbTable,
    FwbTableHead,
    FwbTableBody,
    FwbTableCell,
    FwbTableRow,
    FwbTableHeadCell,
    FwbButton,
} from "flowbite-vue";
import { DateTime } from "luxon";
const invoiceDetails = useInvoiceDetailsStore();

const { invoices, load } = useInvoice();
const deleteInvoice = (id) => {
    window.axios.delete(`/api/v1/invoices/${id}`).then(() => {
        toast.success("Invoice deleted");
        load();
    });
};
onMounted(() => {
    load();
});
</script>
<template>
    <fwb-table class="" hoverable>
        <fwb-table-head>
            <fwb-table-head-cell>No.</fwb-table-head-cell>
            <fwb-table-head-cell>Total Amount</fwb-table-head-cell>
            <fwb-table-head-cell>Due Ammount</fwb-table-head-cell>
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
                    {{
                        currencyPrint(
                            Number(obj.total),
                            invoiceDetails.companyData?.currency,
                        )
                    }}
                </fwb-table-cell>
                <fwb-table-cell>
                    {{
                        currencyPrint(
                            Number(obj.due_ammount),
                            invoiceDetails.companyData?.currency,
                        )
                    }}
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
                <fwb-table-cell class="flex gap-2 justfiy-end">
                    <router-link
                        class="ml-auto"
                        :to="{
                            name: 'invoices.form',
                            params: {
                                inv_id: obj.id,
                            },
                        }"
                        >Open</router-link
                    >
                    <InteractiveToast>
                        <template #trigger>
                            <fwb-button class="ml-2" size="xs" color="red"
                                >Delete</fwb-button
                            >
                        </template>
                        <template #title> Are you sure? </template>

                        <template #content
                            >Changes are ireversable and you will lose all data
                            related to <b>{{ obj.number }}</b> invoice
                        </template>
                        <template #actions>
                            <fwb-button
                                @click="() => deleteInvoice(obj.id)"
                                class="ml-2"
                                size="xs"
                                color="red"
                                >Yes, delete it</fwb-button
                            >
                        </template>
                    </InteractiveToast>
                </fwb-table-cell>
            </fwb-table-row>
        </fwb-table-body>
    </fwb-table>
</template>
