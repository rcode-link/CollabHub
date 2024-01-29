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
    });
    const save = () => {
      window.axios.post("/api/v1/customers", model.value).then(() => {
        emit("update");
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
        <Label forInput="title">Name</Label>
        <Text name="title" v-model="model.name"></Text>
      </div>
      <FwbHeading tag="h4">Address</FwbHeading>

      <div class="mb-4">
        <Label forInput="title">Address</Label>
        <Text name="title" v-model="model.address"></Text>
      </div>
      <div class="mb-4">
        <Label forInput="title">City</Label>
        <Text name="title" v-model="model.city"></Text>
      </div>
      <div class="mb-4">
        <Label forInput="title">Zip</Label>
        <Text name="title" v-model="model.zip"></Text>
      </div>

      <div class="mb-4">
        <Label forInput="title">Country</Label>
        <Text name="title" v-model="model.country"></Text>
      </div>
      <FwbHeading tag="h4">Billing address</FwbHeading>
      <div class="mb-4">
        <Label forInput="title">Address</Label>
        <Text name="title" v-model="model.billing_address"></Text>
      </div>
      <div class="mb-4">
        <Label forInput="title">City</Label>
        <Text name="title" v-model="model.billing_city"></Text>
      </div>
      <div class="mb-4">
        <Label forInput="title">Zip</Label>
        <Text name="title" v-model="model.billing_zip"></Text>
      </div>

      <div class="mb-4">
        <Label forInput="title">Country</Label>
        <Text name="title" v-model="model.billing_country"></Text>
      </div>
    </template>
    <template #footer>
      <FwbButton @click="save">Save</FwbButton>
    </template>
  </fwb-modal>
</template>
