<script lang="js" setup>
import Text from "@/components/shared/Text.vue";
import Label from "@/components/shared/Label.vue";
import UiSelect from "@/components/shared/ui/Select.vue";
import { onMounted, ref, watch } from "vue";

const currency = ref();
const load = () => {
    window.axios.get("/api/v1/currency").then((res) => {
        currency.value = res.data.data;
    });
};

const props = defineProps(['modelValue']);

onMounted(() => {
    load();
});

const emit = defineEmits(["update:modelValue"]);

watch(
    () => props.modelValue,
    () => {
        emit("update:modelValue", props.modelValue);
    }
);
</script>
<template>
    <div class="space-y-4">
        <div>
            <Label forInput="currency_id">Currency</Label>
            <UiSelect
                name="currency_id"
                v-model="modelValue.currency_id"
            >
                <option value="">Select currency...</option>
                <option
                    v-for="obj in currency"
                    :key="obj.id"
                    :value="obj.id"
                >
                    {{ obj.currency }}
                </option>
            </UiSelect>
        </div>

        <h3 class="text-base font-semibold text-gray-900 dark:text-white pt-2">Address</h3>

        <div>
            <Label forInput="address">Address</Label>
            <Text name="address" v-model="modelValue.address" />
        </div>
        <div>
            <Label forInput="city">City</Label>
            <Text name="city" v-model="modelValue.city" />
        </div>
        <div>
            <Label forInput="zip">Zip</Label>
            <Text name="zip" v-model="modelValue.zip" />
        </div>
        <div>
            <Label forInput="country">Country</Label>
            <Text name="country" v-model="modelValue.country" />
        </div>

        <h3 class="text-base font-semibold text-gray-900 dark:text-white pt-2">Billing address</h3>

        <div>
            <Label forInput="billing_address">Address</Label>
            <Text name="billing_address" v-model="modelValue.billing_address" />
        </div>
        <div>
            <Label forInput="billing_city">City</Label>
            <Text name="billing_city" v-model="modelValue.billing_city" />
        </div>
        <div>
            <Label forInput="billing_zip">Zip</Label>
            <Text name="billing_zip" v-model="modelValue.billing_zip" />
        </div>
        <div>
            <Label forInput="billing_country">Country</Label>
            <Text name="billing_country" v-model="modelValue.billing_country" />
        </div>

        <h3 class="text-base font-semibold text-gray-900 dark:text-white pt-2">Invoice settings</h3>

        <div>
            <Label forInput="invoice_cc_emails">Send copy of invoices to</Label>
            <Text name="invoice_cc_emails" v-model="modelValue.invoice_cc_emails" placeholder="email1@example.com, email2@example.com" />
            <p class="mt-1 text-xs text-gray-400 dark:text-gray-500">Comma-separated email addresses that will receive a copy of every sent invoice</p>
        </div>
    </div>
</template>
