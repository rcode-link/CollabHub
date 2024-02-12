<script setup lang="ts">
import Modal from "@/components/shared/Modal.vue";
import Label from "@/components/shared/Label.vue";
import Text from "@/components/shared/Text.vue";
import { FwbButton, FwbSelect } from "flowbite-vue";
import { computed, onMounted, ref, watch } from "vue";
import DatePicker from "@/components/shared/DatePicker.vue";
import { useInvoiceDetailsStore } from "@/store/invoiceDetailsStore";
import useInvoice from "@/components/pages/invoices/details/functions/useInvoice";
import currencyPrint from "@/functions/currencyPrint";
import { DateTime } from "luxon";

const invoiceStore = useInvoiceDetailsStore();
const { invoices, load, route } = useInvoice();

const modalRef = ref();

const emit = defineEmits<{
    (e: "update"): void;
}>();
onMounted(() => {
    load();
});
interface iPayment {
    value?: string;
    date: string;
    invoice_id?: string;
}
const model = ref<iPayment>({
    date: "",
});

watch(
    () => route.params.inv_id,
    () => {
        if (route.params.inv_id) {
            model.value.invoice_id = route.params.inv_id.toString();
        }
    },
    {
        immediate: true,
        deep: true,
    }
);

const submit = () => {
    window.axios.post("/api/v1/payments", model.value).then(() => {
        emit("update");
        modalRef.value.closeModal();
    });
};
const canSelectInvoice = computed(() => {
    return route.params.inv_id?.length > 0;
});
</script>
<template>
    <Modal ref="modalRef">
        <template #button>
            <fwb-button color="yellow" size="xs">Record payment</fwb-button>
        </template>
        <template #header> Record payment </template>
        <template #body>
            <form @submit.prevent="submit">
                <div class="mb-4">
                    <Label forInput="invoice"> Invoice </Label>
                    <FwbSelect
                        name="invoice"
                        v-model="model.invoice_id"
                        :disabled="canSelectInvoice"
                        :options="
                            invoices?.data.map((obj) => {
                                return {
                                    value: obj.id.toString(),
                                    name: `${obj.number} | ${DateTime.fromSQL(
                                        obj.date
                                    ).toLocaleString(
                                        DateTime.DATE_SHORT
                                    )} | ${currencyPrint(
                                        Number(obj.total),
                                        invoiceStore.companyData?.currency
                                    )}`,
                                };
                            })
                        "
                    ></FwbSelect>
                </div>
                <div class="mb-4">
                    <Label forInput="amount"> Amount </Label>
                    <Text name="amount" v-model="model.value"></Text>
                </div>
                <div class="mb-4">
                    <Label forInput="date"> Date of payment </Label>
                    <DatePicker v-model="model.date" name="date" />
                </div>
            </form>
        </template>
        <template #footer>
            <FwbButton @click="submit">Save</FwbButton>
        </template>
    </Modal>
</template>
