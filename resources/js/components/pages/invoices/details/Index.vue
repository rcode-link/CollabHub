<script lang="js" setup>
import Auth from "../../../layouts/Auth.vue";
import { FwbHeading, FwbP, FwbTab, FwbTabs } from "flowbite-vue";
import { ref, watch } from "vue";
import Invoice from "./partials/invoice/List.vue";
import Payments from "./partials/payment/Payments.vue";
import { useRoute } from "vue-router";
import Card from "../../../shared/Card.vue";
import { useInvoiceDetailsStore } from "@/store/invoiceDetailsStore";
import { Chart as ChartJS, registerables } from "chart.js";

ChartJS.register(...registerables);
const route = useRoute();
const activeTab = ref("invoice");
const invoiceDetails = useInvoiceDetailsStore();
watch(
    () => route.params.id,
    () => {
        invoiceDetails.loadCompanyData();
    },
    {
        immediate: true,
    },
);
</script>
<template>
  <Auth>
    <Card class="gap-4 flex-col md:flex-row items-center">
      <object
        class="img"
        :data="`https://placehold.co/300x300/png?text=${invoiceDetails.companyData?.name}`"
        type="image/png"
      >
        <img :src="invoiceDetails.companyData?.logo" class="w-80" />
      </object>

      <object></object>
      <div class="">
        <fwb-heading tag="h3">
          {{ invoiceDetails.companyData?.name }}
        </fwb-heading>
        <fwb-p>
          <b>Address:</b>
          {{ invoiceDetails.companyData?.address }}
          {{ invoiceDetails.companyData?.city }}
          {{ invoiceDetails.companyData?.zip }},
          {{ invoiceDetails.companyData?.country }}
        </fwb-p>
        <fwb-p>
          <b> Billing Address: </b>
          {{
            invoiceDetails.companyData?.billing_address ??
            invoiceDetails.companyData?.address
          }}
          {{
            invoiceDetails.companyData?.billing_city ??
            invoiceDetails.companyData?.city
          }}
          {{
            invoiceDetails.companyData?.billing_zip ??
            invoiceDetails.companyData?.zip
          }},
          {{
            invoiceDetails.companyData?.billing_country ??
            invoiceDetails.companyData?.country
          }}
        </fwb-p>
      </div>
    </Card>
    <fwb-tabs variant="pills" v-model="activeTab">
      <fwb-tab name="invoice" title="Invoices">
        <invoice :name="invoiceDetails.companyData?.name" />
      </fwb-tab>
      <fwb-tab name="payment" title="Payments">
        <payments />
      </fwb-tab>
    </fwb-tabs>
  </Auth>
</template>
