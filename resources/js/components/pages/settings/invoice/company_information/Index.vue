<script lang="js" setup>
import Settings from "@/components/layouts/Settings.vue";
import Card from "@/components/shared/Card.vue";
import { onMounted, ref, watch } from "vue";
import { FwbButton } from "flowbite-vue";
import { useUserStore } from "@/store/user";
import { toast } from "vue3-toastify";
import CompnayBillingInformation from "@/components/shared/forms/company/CompnayBillingInformation.vue";
const userStore = useUserStore();
const currency = ref();
const load = () => {
    window.axios.get("/api/v1/currency").then((res) => {
        currency.value = res.data.data;
    });
};

const model = ref({
    name: "",
});

watch(
    () => userStore.company,
    () => {
        model.value = {
            id: userStore.company.id,
            name: userStore.company.name,
            currency_id: userStore.company.currency_id?.toString() ?? undefined,
            address: userStore.company.address ?? undefined,
            city: userStore.company.city ?? undefined,
            zip: userStore.company.zip ?? undefined,
            country: userStore.company.country ?? undefined,
            billing_address: userStore.company.billing_address ?? undefined,
            billing_city: userStore.company.billing_city ?? undefined,
            billing_zip: userStore.company.billing_zip ?? undefined,
            billing_country: userStore.company.billing_country ?? undefined,
            prefix: userStore.company.prefix ?? undefined,
        };
    },
    {
        immediate: true,
    }
);

const save = () => {
    window.axios
        .put(`/api/v1/customers/${userStore.company.id}`, model.value)
        .then(() => {
            toast.success("Company information updated");
        });
};

onMounted(() => {
    load();
});
</script>
<template>
    <Settings>
        <Card class="flex-col">
            <form @submit.prevent="save">
                <CompnayBillingInformation v-model="model" />
                <FwbButton>Save</FwbButton>
            </form>
        </Card>
    </Settings>
</template>
