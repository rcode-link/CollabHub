<script lang="js" setup>
import { FwbModal, FwbButton } from "flowbite-vue";

import { onMounted, ref } from "vue";
import Form from "./Form.vue";

const emit = defineEmits(['update']);
    defineProps(
    {
        title: "Add customer",
    })
const currency = ref();
const load = () => {
    window.axios.get("/api/v1/currency").then((res) => {
        currency.value = res.data.data;
    });
};

const showModal = ref(false);

const modalClosed = () => {
    showModal.value = false;
};

const model = ref({
    name: "",
    currency_id: undefined,
});
const save = () => {
    window.axios
        .post("/api/v1/customers", model.value)
        .then(() => {
            emit("update");
        })
};

onMounted(() => {
    load();
});
</script>

<template>
    <fwb-button size="xs" @click="() => (showModal = true)" class="ml-auto">
        Add customer
    </fwb-button>
    <fwb-modal v-if="showModal" @close="modalClosed">
        <template #header> Add new customer </template>
        <template #body>
            <Form v-model="model" />
        </template>
        <template #footer>
            <FwbButton @click="save">Save</FwbButton>
        </template>
    </fwb-modal>
</template>
