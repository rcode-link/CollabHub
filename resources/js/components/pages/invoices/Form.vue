<script lang="ts">
//@ts-ignore
import { FwbModal, FwbButton, FwbHeading } from "flowbite-vue";
//@ts-ignore
import Text from "../../shared/Text.vue";
//@ts-ignore
import Label from "../../shared/Label.vue";

import { ref } from "vue";
import { iCustomer } from "./interfaces";

export default {
    components: {
        FwbButton,
        FwbModal,
        FwbHeading,
        Text,
        Label,
    },
    setup({}, { emit }) {
        const showModal = ref<boolean>(false);

        const modalClosed = () => {
            showModal.value = false;
        };

        const model = ref<iCustomer>({
            id: null,
            name: "",
            address: null,
            city: null,
            zip: null,
            country: null,
            billing_address: null,
            billing_city: null,
            billing_zip: null,
            billing_country: null,
            prefix: null,
        });
        const save = () => {
            window.axios
                .post("/api/v1/customers", model.value)
                .then(() => {
                    emit("update");
                })
                .catch((err) => {
                    if (err.response.status === 422) console.log();
                });
        };
        return {
            showModal,
            modalClosed,
            model,
            save,
        };
    },
};
</script>

<template>
    <fwb-button size="xs" @click="() => (showModal = true)" class="ml-auto"
        >Add customer</fwb-button
    >

    <fwb-modal v-if="showModal" @close="modalClosed">
        <template #header> Add new customer </template>
        <template #body>
            <div class="mb-4">
                <Label forInput="name">Name</Label>
                <Text name="name" v-model="model.name"></Text>
            </div>
            <div class="mb-4">
                <Label forInput="prefix"
                    >Prefix <small>(used for invoice number)</small></Label
                >
                <Text name="prefix" v-model="model.prefix"></Text>
            </div>
            <FwbHeading tag="h4">Address</FwbHeading>

            <div class="mb-4">
                <Label forInput="address">Address</Label>
                <Text name="address" v-model="model.address"></Text>
            </div>
            <div class="mb-4">
                <Label forInput="city">City</Label>
                <Text name="city" v-model="model.city"></Text>
            </div>
            <div class="mb-4">
                <Label forInput="zip">Zip</Label>
                <Text name="zip" v-model="model.zip"></Text>
            </div>

            <div class="mb-4">
                <Label forInput="country">Country</Label>
                <Text name="country" v-model="model.country"></Text>
            </div>
            <FwbHeading tag="h4">Billing address</FwbHeading>
            <div class="mb-4">
                <Label forInput="billing_address">Address</Label>
                <Text
                    name="billing_address"
                    v-model="model.billing_address"
                ></Text>
            </div>
            <div class="mb-4">
                <Label forInput="billing_city">City</Label>
                <Text name="billing_city" v-model="model.billing_city"></Text>
            </div>
            <div class="mb-4">
                <Label forInput="billing_zip">Zip</Label>
                <Text name="billing_zip" v-model="model.billing_zip"></Text>
            </div>

            <div class="mb-4">
                <Label forInput="billing_country">Country</Label>
                <Text
                    name="billing_country"
                    v-model="model.billing_country"
                ></Text>
            </div>
        </template>
        <template #footer>
            <FwbButton @click="save">Save</FwbButton>
        </template>
    </fwb-modal>
</template>
