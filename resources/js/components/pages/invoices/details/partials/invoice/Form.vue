<script lang="js" setup>
import { FwbModal, FwbButton } from "flowbite-vue";
import Text from "@/components/shared/Text.vue";
import Label from "@/components/shared/Label.vue";

import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import DatePicker from "@/components/shared/DatePicker.vue";
import { useInvoiceDetailsStore } from "@/store/invoiceDetailsStore";

const props = defineProps(['numberOfInvoices']);
const showModal = ref(false);
const route = useRoute();
const router = useRouter();
const modalClosed = () => {
    showModal.value = false;
};
const invoiceDetails = useInvoiceDetailsStore();

const number = (props.numberOfInvoices + 1).toString().padStart(5, "0");
const model = ref({
    number: `INV-${invoiceDetails.companyData?.prefix}-${number}`,
    company_id: route.params.id.toString() ?? "",
    due_date: "",
    date: "",
});
const save = () => {
    window.axios.post("/api/v1/invoices", model.value).then((res) => {
        router.push({
            name: "invoices.form",
            params: {
                inv_id: res.data.data.id,
            },
        });
    });
};
</script>

<template>
  <fwb-button size="xs" @click="() => (showModal = true)" class="ml-auto"
    >Add Invoice</fwb-button
  >

  <fwb-modal v-if="showModal" @close="modalClosed">
    <template #header> Add new customer </template>
    <template #body>
      <div class="mb-4">
        <Label forInput="number">Invoice number</Label>
        <Text name="number" v-model="model.number"></Text>
      </div>
      <div class="mb-4">
        <Label forInput="date">Date</Label>
        <DatePicker name="date" v-model="model.date" />
      </div>
      <div class="mb-4">
        <Label forInput="due_date">Due date</Label>
        <DatePicker name="due_date" v-model="model.due_date" />
      </div>
    </template>
    <template #footer>
      <FwbButton @click="save">Save</FwbButton>
    </template>
  </fwb-modal>
</template>
