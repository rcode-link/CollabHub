<script lang="ts" setup>
import Text from "../../shared/Text.vue";
import Label from "../../shared/Label.vue";

import { ref, watch } from "vue";
import { iCustomer } from "./interfaces";
import CompnayBillingInformation from "@/components/shared/forms/company/CompnayBillingInformation.vue";

const model = ref<iCustomer>({
    name: "",
});

const emit = defineEmits<{
    (e: "update:modelValue", value: iCustomer): void;
}>();

watch(
    () => model,
    () => {
        emit("update:modelValue", model.value);
    },
    {
        deep: true,
    }
);
</script>

<template>
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
    <CompnayBillingInformation v-model="model" />
</template>
