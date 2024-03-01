import { defineStore } from "pinia";
import { ref } from "vue";
import { useRoute } from "vue-router";

export const useInvoiceDetailsStore = defineStore("invoiceDetailsStore", () => {
    const route = useRoute();
    const companyData = ref();
    const data = ref({
        company_id: 0,
        date: "",
        discont: 0,
        due_date: "",
        id: 0,
        note: "",
        number: "",
        sent: false,
        total: "",
    });

    const loadCompanyData = () => {
        window.axios.get(`/api/v1/customers/${route.params.id}`).then((res) => {
            companyData.value = res.data.data;
        });
    };
    const load = async () => {
        return window.axios
            .get(`/api/v1/invoices/${route.params.inv_id}`)
            .then((res) => {
                data.value = res.data.data;
                return Promise.resolve(res.data.data);
            })
            .catch((e) => Promise.reject(e));
    };

    return {
        loadCompanyData,
        load,
        data,
        companyData,
    };
});
