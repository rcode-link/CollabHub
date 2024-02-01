<script lang="ts">
import { ref } from "vue";
import AutoComplete from "../../../../../shared/AutoComplete.vue";
import { BillingItemResource } from "../../../../../../types";
import { useRoute } from "vue-router";
export default {
  components: {
    AutoComplete,
  },
  setup() {
    const itemList = ref<BillingItemResource[]>([]);
    const route = useRoute();
    const searchItems = (val: string) => {
      console.log(val);
    };

    const load = () => {
      window.axios.get("/api/v1/billing-items").then((res) => {
        itemList.value = res.data.data;
      });
    };

    const selected = (val: number) => {
      window.axios.post(`/api/v1/invoices-items`, {
        item_id: val,
        invoice_id: route.params.inv_id,
      });
    };

    return {
      itemList,
      searchItems,
      load,
      selected,
    };
  },
  created() {
    this.load();
  },
};
</script>

<template>
  <AutoComplete
    :items="
      itemList.map((obj) => {
        return {
          label: obj.name,
          value: obj.id,
        };
      })
    "
    :key="itemList.length"
    @search="searchItems"
    @selected="selected"
  />
</template>