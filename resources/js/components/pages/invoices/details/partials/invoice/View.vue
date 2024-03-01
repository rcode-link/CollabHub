<script lang="js" setup>
import { useRoute } from "vue-router";
import Auth from "@/components/layouts/Auth.vue";
import Card from "@/components/shared/Card.vue";
import Label from "@/components/shared/Label.vue";
import Text from "@/components/shared/Text.vue";
import DatePicker from "@/components/shared/DatePicker.vue";
import currencyPrint from "@/functions/currencyPrint";
import { onUnmounted, ref, watch } from "vue";
import {
    FwbButton,
    FwbDropdown,
    FwbHeading,
    FwbListGroup,
    FwbListGroupItem,
    FwbP,
} from "flowbite-vue";
import Editor from "@/components/pages/project/tasks/partisals/Form/Editor.vue";

import {
    FwbTable,
    FwbTableHead,
    FwbTableBody,
    FwbTableCell,
    FwbTableRow,
    FwbTableHeadCell,
} from "flowbite-vue";
import SearchInvoiceItems from "./partials/SearchInvoiceItems.vue";
import InvoiceItem from "./partials/InvoiceItem.vue";
import { debounce } from "lodash";
import Options from "./partials/Options.vue";
import { useInvoiceDetailsStore } from "@/store/invoiceDetailsStore";
const route = useRoute();
const invoiceStore = useInvoiceDetailsStore();
onUnmounted(() => {
    window.Echo.leave(`update-invoice.${route.params.inv_id}`);
});

const noteValue = ref(null);
const predefinedNotes = ref([]);
const loadNotes = () => {
    window.axios
        .get("/api/v1/invoice/data", {
            params: {
                type: "note",
            },
        })
        .then((res) => {
            predefinedNotes.value = res.data;
        });
};

watch(
    () => route.params.inv_id,
    () => {
        window.Echo.private(`update-invoice.${route.params.inv_id}`).listen(
            "InvoiceItemsUpdate",
            (list) => {
                invoiceStore.data = list.items;
            }
        );
        invoiceStore.load().then((data) => {
            if (!data) {
                return;
            }
            noteValue.value = data.note;
        });
        loadNotes();
    },
    {
        immediate: true,
    }
);

const updateNote = debounce(function (value) {
    window.axios.put(`/api/v1/invoices/${invoiceStore.data.id}`, {
        note: value,
    });
}, 500);
</script>
<template>
    <Auth>
        <div class="grid grid-cols-2 gap-4" v-if="invoiceStore.data">
            <Card class="items-center">
                <div class="">
                    <fwb-heading tag="h3">
                        {{ invoiceStore.data?.company?.name }}
                    </fwb-heading>
                    <fwb-p>
                        {{
                            invoiceStore.data?.company?.billing_address ??
                            invoiceStore.data?.company?.address
                        }}
                        <br />

                        {{
                            invoiceStore.data?.company?.billing_city ??
                            invoiceStore.data?.company?.city
                        }}
                        {{
                            invoiceStore.data?.company?.billing_zip ??
                            invoiceStore.data?.company?.zip
                        }},
                        <br />
                        {{
                            invoiceStore.data?.company?.billing_country ??
                            invoiceStore.data?.company?.country
                        }}
                    </fwb-p>
                    <fwb-p v-if="invoiceStore.data.sent" class="font-bold">
                        Invoice sent
                    </fwb-p>
                </div>
                <div class="ml-auto mt-auto flex gap-4">
                    <Options />
                </div>
            </Card>
            <div class="flex flex-col gap-4 justify-between">
                <div>
                    <Label>Invoice No:</Label>
                    <Text v-model="invoiceStore.data.number" />
                </div>
                <div>
                    Invoice Date:
                    <DatePicker v-model="invoiceStore.data.date" />
                </div>
                <div>
                    Invoice Due date:
                    <DatePicker v-model="invoiceStore.data.due_date" />
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
            <fwb-table-body v-if="invoiceStore.data?.items">
                <invoice-item
                    v-for="(obj, index) in invoiceStore.data.items"
                    :index="index.toString()"
                    :item="obj"
                    :key="obj.id"
                    :currency="invoiceStore.data?.company?.currency"
                />
            </fwb-table-body>
        </fwb-table>
        <div class="grid grid-cols-3 gap-4" v-if="invoiceStore.data">
            <div>
                <Editor
                    :model-value="noteValue ?? ''"
                    @update:markdown="updateNote"
                >
                    <template #header>
                        <FwbDropdown text="Notes">
                            <template #trigger>
                                <FwbButton size="sm" color="alternative"
                                    >Insert note</FwbButton
                                >
                            </template>
                            <FwbListGroup>
                                <FwbListGroupItem
                                    v-for="obj in predefinedNotes"
                                    :key="obj.id"
                                    class="cursor-pointer"
                                    @click="
                                        () => {
                                            noteValue = obj.data.val;
                                            updateNote(obj.data.val);
                                        }
                                    "
                                >
                                    {{ obj.data.title }}
                                </FwbListGroupItem>
                            </FwbListGroup>
                        </FwbDropdown>
                    </template>
                </Editor>
            </div>
            <div></div>
            <div class="flex">
                <fwb-table class="overflow-auto w-full mt-auto">
                    <fwb-table-row>
                        <fwb-table-head-cell> Total </fwb-table-head-cell>
                        <fwb-table-cell>
                            {{
                                currencyPrint(
                                    Number(invoiceStore.data.total),
                                    invoiceStore.data?.company?.currency
                                )
                            }}</fwb-table-cell
                        >
                    </fwb-table-row>
                </fwb-table>
            </div>
        </div>
    </Auth>
</template>
