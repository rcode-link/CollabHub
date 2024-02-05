<script lang="ts" setup>
import PaymentForm from "@/components/pages/invoices/details/partials/payment/Form.vue";
import currencyPrint from "@/functions/currencyPrint";
import { useInvoiceDetailsStore } from "@/store/invoiceDetailsStore";
import { DateTime } from "luxon";
import { ref } from "vue";

import {
    FwbTable,
    FwbTableHead,
    FwbTableBody,
    FwbTableCell,
    FwbTableRow,
    FwbTableHeadCell,
} from "flowbite-vue";
import { useRoute } from "vue-router";
const invoiceDetails = useInvoiceDetailsStore();

const data = ref<any[]>();
const route = useRoute();
const load = () => {
    window.axios
        .get("/api/v1/payments", {
            params: {
                company_id: route.params.id,
            },
        })
        .then((res) => {
            data.value = res.data.data;
        });
};

load();
</script>
<template>
    <fwb-table class="" hoverable>
        <fwb-table-head>
            <fwb-table-head-cell>Invoice No.</fwb-table-head-cell>
            <fwb-table-head-cell>Total</fwb-table-head-cell>
            <fwb-table-head-cell>Date</fwb-table-head-cell>
            <fwb-table-head-cell class="flex justify-end">
                <PaymentForm @update="load" />
            </fwb-table-head-cell>
        </fwb-table-head>
        <fwb-table-body>
            <fwb-table-row
                v-for="obj in data"
                class="cursor-pointer"
                :key="obj.id"
            >
                <fwb-table-cell>
                    <router-link
                        :to="{
                            name: 'invoices.form',
                            params: {
                                inv_id: obj.invoice.id,
                            },
                        }"
                        >{{ obj.invoice.number }}</router-link
                    >
                </fwb-table-cell>
                <fwb-table-cell>
                    {{
                        currencyPrint(
                            Number(obj.value),
                            invoiceDetails.companyData?.currency
                        )
                    }}
                </fwb-table-cell>
                <fwb-table-cell>
                    {{ DateTime.fromSQL(obj.date).toLocaleString() }}
                </fwb-table-cell>

                <fwb-table-cell> </fwb-table-cell>
            </fwb-table-row>
        </fwb-table-body>
    </fwb-table>
</template>
