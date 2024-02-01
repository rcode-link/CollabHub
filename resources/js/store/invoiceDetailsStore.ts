import { CustomerResource } from "@/types";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useRoute } from "vue-router";

export const useInvoiceDetailsStore = defineStore("invoiceDetailsStore", () => {
    const route = useRoute();
    const companyData = ref<CustomerResource>();
    const loadCompanyData = () => {
        window.axios.get(`/api/v1/customers/${route.params.id}`).then((res) => {
            companyData.value = res.data.data;
        });
    };

    return {
        loadCompanyData,
        companyData,
    };
});
