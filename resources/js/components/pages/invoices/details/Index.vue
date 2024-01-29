<script lang="ts">
import Auth from "../../../layouts/Auth.vue";
import { FwbButton, FwbHeading, FwbP, FwbTab, FwbTabs } from "flowbite-vue";
import { ref, watch } from "vue";
import Invoice from "./partials/Invoice.vue";
import Payments from "./partials/Payments.vue";
import { useRoute } from "vue-router";
import Card from "../../../shared/Card.vue";
import { CustomerResource } from "../../../../types";

export default {
  components: {
    Auth,
    FwbButton,
    FwbTab,
    FwbTabs,
    FwbP,
    FwbHeading,
    Invoice,
    Payments,
    Card,
  },
  setup() {
    const router = useRoute();
    const activeTab = ref<string>("invoice");
    const data = ref<CustomerResource>();

    const loadCompanyData = () => {
      window.axios.get(`/api/v1/customers/${router.params.id}`).then((res) => {
        data.value = res.data.data;
      });
    };

    watch(
      () => router.params.id,
      () => {
        loadCompanyData();
      },
      {
        immediate: true,
      }
    );

    const getPropValue = (
      obj: any,
      prop: string,
      fallBack?: string
    ): string => {
      if (!obj) {
        return "";
      }
      if (prop in obj && obj[prop]) {
        return obj[prop];
      }

      if (fallBack && fallBack in obj) {
        return obj[fallBack];
      }

      return "";
    };

    return { activeTab, data, getPropValue };
  },
};
</script>
<template>
  <Auth>
    <Card class="gap-4">
      <img :src="data?.logo" class="w-80" />
      <div class="">
        <fwb-heading tag="h3">
          {{ data?.name }}
        </fwb-heading>
        <fwb-p>
          <b>Address:</b>
          {{ getPropValue(data, "address") }}
          {{ getPropValue(data, "city") }} {{ getPropValue(data, "zip") }},
          {{ getPropValue(data, "country") }}
        </fwb-p>
        <fwb-p>
          <b> Billing Address: </b>
          {{ getPropValue(data, "billing_address", "address") }}
          {{ getPropValue(data, "billing_city", "city") }}
          {{ getPropValue(data, "billing_zip", "zip") }},
          {{ getPropValue(data, "billing_country", "country") }}
        </fwb-p>
      </div>
    </Card>
    <fwb-tabs variant="pills" v-model="activeTab">
      <fwb-tab name="invoice" title="Invoices"> <invoice /> </fwb-tab>
      <fwb-tab name="payment" title="Payments"> <payments /> </fwb-tab>
    </fwb-tabs>
  </Auth>
</template>
