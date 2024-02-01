<script lang="ts">
import { ref } from "vue";
import Form from "./Form.vue";
//@ts-ignore
import { TailwindPagination } from "laravel-vue-pagination";

//@ts-ignore
import Auth from "../../layouts/Auth.vue";
import {
  FwbButton,
  FwbTable,
  FwbTableBody,
  FwbTableCell,
  FwbTableHead,
  FwbTableHeadCell,
  FwbTableRow,
  FwbSpinner,
} from "flowbite-vue";
import { iCustomer } from "./interfaces";
import { Pagination } from "../../../interfaces";
interface Response extends Pagination {
  data: iCustomer[];
}
export default {
  components: {
    Form,
    FwbButton,
    FwbTable,
    FwbTableBody,
    FwbTableCell,
    FwbTableHead,
    FwbTableHeadCell,
    FwbTableRow,
    FwbSpinner,
    Auth,
    TailwindPagination,
  },
  setup() {
    const loading = ref(false);
    const companies = ref<Response>();

    const load = (page: number = 1) => {
      loading.value = true;
      window.axios
        .get("/api/v1/customers", {
          params: {
            page,
          },
        })
        .then((res) => {
          companies.value = res.data;
          loading.value = false;
        });
    };
    return {
      loading,
      companies,
      load,
    };
  },
  mounted() {
    this.load();
  },
};
</script>
<template>
  <Auth>
    <fwb-table v-if="!loading" class="" hoverable>
      <fwb-table-head>
        <fwb-table-head-cell>Id</fwb-table-head-cell>
        <fwb-table-head-cell>Name</fwb-table-head-cell>
        <fwb-table-head-cell class="flex">
          <Form @update="load" />
        </fwb-table-head-cell>
      </fwb-table-head>
      <fwb-table-body v-if="companies?.data">
        <fwb-table-row
          v-for="obj in companies.data"
          class="cursor-pointer"
          :key="obj.id + obj.name"
        >
          <fwb-table-cell>
            {{ obj.id }}
          </fwb-table-cell>
          <fwb-table-cell>
            {{ obj.name }}
          </fwb-table-cell>
          <fwb-table-cell>
            <router-link
              :to="{
                name: 'invoices.details',
                params: {
                  id: obj.id,
                },
              }"
              >Open</router-link
            >
          </fwb-table-cell>
        </fwb-table-row>
      </fwb-table-body>
    </fwb-table>
    <TailwindPagination
      v-if="companies"
      :limit="3"
      :data="companies"
      @pagination-change-page="load"
    />
    <FwbSpinner v-if="loading" class="mx-auto" size="9" />
  </Auth>
</template>
