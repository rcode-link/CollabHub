<script lang="ts" setup>
import { useRoute } from "vue-router";
import Auth from "@/components/layouts/Auth.vue";
import Card from "@/components/shared/Card.vue";
import Label from "@/components/shared/Label.vue";
import Text from "@/components/shared/Text.vue";
import DatePicker from "@/components/shared/DatePicker.vue";
import { onUnmounted, ref, watch } from "vue";
import { InvoiceResource } from "@/components/../types";
import { FwbHeading, FwbP } from "flowbite-vue";
import Editor from "@/components/pages/project/tasks/partisals/Form/Editor.vue";

import {
    FwbTable,
    FwbTableHead,
    FwbTableBody,
    FwbTableCell,
    FwbTableRow,
    FwbTableHeadCell,
} from "flowbite-vue";
import SearchInvoiceItems from "./SearchInvoiceItems.vue";
import InvoiceItem from "./InvoiceItem.vue";
import { debounce } from "lodash";
import Options from "./Options.vue";
const route = useRoute();

onUnmounted(() => {
    window.Echo.leave(`update-invoice.${route.params.inv_id}`);
});

const data = ref<InvoiceResource>();
const noteValue = ref<string | null>(null);
const load = () => {
    window.axios.get(`/api/v1/invoices/${route.params.inv_id}`).then((res) => {
        data.value = res.data.data;
        noteValue.value = data.value?.note ?? "";
    });
};

watch(
    () => route.params.inv_id,
    () => {
        window.Echo.private(`update-invoice.${route.params.inv_id}`).listen(
            "InvoiceItemsUpdate",
            (list: any) => {
                data.value = list.items;
            }
        );
        load();
    },
    {
        immediate: true,
    }
);

const updateNote = debounce(function (value: any) {
    window.axios.put(`/api/v1/invoices/${data.value?.id}`, {
        note: value,
    });
}, 500);
</script>
<template>
    <Auth>
        <div class="grid grid-cols-2 gap-4" v-if="data">
            <Card class="items-center">
                <div class="">
                    <fwb-heading tag="h3">
                        {{ data?.company?.name }}
                    </fwb-heading>
                    <fwb-p>
                        {{
                            data?.company?.billing_address ??
                            data?.company?.address
                        }}
                        <br />

                        {{ data?.company?.billing_city ?? data?.company?.city }}
                        {{ data?.company?.billing_zip ?? data?.company?.zip }},
                        <br />
                        {{
                            data?.company?.billing_country ??
                            data?.company?.country
                        }}
                    </fwb-p>
                </div>
                <div class="ml-auto mt-auto flex gap-4">
                    <Options />
                </div>
            </Card>
            <div class="flex flex-col gap-4 justify-between">
                <div>
                    <Label>Invoice No:</Label>
                    <Text v-model="data.number" />
                </div>
                <div>
                    Invoice Date:
                    <DatePicker v-model="data.date" />
                </div>
                <div>
                    Invoice Due date:
                    <DatePicker v-model="data.due_date" />
                </div>
            </div>
        </div>

        <search-invoice-items />
        <fwb-table class="overflow-auto">
            <fwb-table-head>
                <fwb-table-head-cell>Order No.</fwb-table-head-cell>
                <fwb-table-head-cell>Name</fwb-table-head-cell>
                <fwb-table-head-cell>Price</fwb-table-head-cell>
                <fwb-table-head-cell>Qty</fwb-table-head-cell>
                <fwb-table-head-cell>Unit</fwb-table-head-cell>
                <fwb-table-head-cell> Total </fwb-table-head-cell>
                <fwb-table-head-cell> </fwb-table-head-cell>
            </fwb-table-head>
            <fwb-table-body v-if="data?.items">
                <invoice-item
                    v-for="(obj, index) in data?.items"
                    :index="index.toString()"
                    :item="obj"
                    :key="obj.id"
                />
            </fwb-table-body>
        </fwb-table>
        <div class="grid grid-cols-3 gap-4" v-if="data">
            <div>
                <Editor
                    :model-value="noteValue ?? ''"
                    @update:markdown="updateNote"
                />
            </div>
            <div></div>
            <div class="flex">
                <fwb-table class="overflow-auto w-full mt-auto">
                    <fwb-table-row>
                        <fwb-table-head-cell> Total </fwb-table-head-cell>
                        <fwb-table-cell>{{
                            data.total.toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                            })
                        }}</fwb-table-cell>
                    </fwb-table-row>
                </fwb-table>
            </div>
        </div>
    </Auth>
</template>
