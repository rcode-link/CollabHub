<script lang="ts" setup>
import Text from "@/components/shared/Text.vue";
import Label from "@/components/shared/Label.vue";
import { onMounted, ref, watch } from "vue";
import { iCustomer } from "@/components/pages/invoices/interfaces";
import { FwbSelect } from "flowbite-vue";

const currency = ref<any[]>();
const load = () => {
    window.axios.get("/api/v1/currency").then((res) => {
        currency.value = res.data.data;
    });
};

const props = defineProps<{
    modelValue: iCustomer;
}>();

onMounted(() => {
    load();
});

const emit = defineEmits<{
    (e: "update:modelValue", value: iCustomer): void;
}>();

watch(
    () => props.modelValue,
    () => {
        emit("update:modelValue", props.modelValue);
    }
);
</script>
<template>
    <div class="mb-4">
        <Label forInput="currency_id"> Currency</Label>
        <FwbSelect
            name="currency_id"
            v-model="modelValue.currency_id"
            :options="
                currency?.map((obj) => {
                    return {
                        value: obj.id,
                        name: obj.currency,
                    };
                })
            "
        ></FwbSelect>
    </div>

    <FwbHeading tag="h4">Address</FwbHeading>

    <div class="mb-4">
        <Label forInput="address">Address</Label>
        <Text name="address" v-model="modelValue.address"></Text>
    </div>
    <div class="mb-4">
        <Label forInput="city">City</Label>
        <Text name="city" v-model="modelValue.city"></Text>
    </div>
    <div class="mb-4">
        <Label forInput="zip">Zip</Label>
        <Text name="zip" v-model="modelValue.zip"></Text>
    </div>

    <div class="mb-4">
        <Label forInput="country">Country</Label>
        <Text name="country" v-model="modelValue.country"></Text>
    </div>
    <FwbHeading tag="h4">Billing address</FwbHeading>
    <div class="mb-4">
        <Label forInput="billing_address">Address</Label>
        <Text
            name="billing_address"
            v-model="modelValue.billing_address"
        ></Text>
    </div>
    <div class="mb-4">
        <Label forInput="billing_city">City</Label>
        <Text name="billing_city" v-model="modelValue.billing_city"></Text>
    </div>
    <div class="mb-4">
        <Label forInput="billing_zip">Zip</Label>
        <Text name="billing_zip" v-model="modelValue.billing_zip"></Text>
    </div>

    <div class="mb-4">
        <Label forInput="billing_country">Country</Label>
        <Text
            name="billing_country"
            v-model="modelValue.billing_country"
        ></Text>
    </div>
</template>
