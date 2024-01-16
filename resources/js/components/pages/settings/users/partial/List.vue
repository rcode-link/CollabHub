<script setup lang="ts">

import {FwbTable, FwbTableBody, FwbTableCell, FwbTableHead, FwbTableHeadCell, FwbTableRow} from "flowbite-vue";
import {useAbility} from "@casl/vue";
import {useBreadcrumbStore} from "../../../../../store/breadcrumb.js";
import {useUserStore} from "../../../../../store/user";
import {ref, watch} from "vue";
import UserIcon from "../../../../shared/UserIcon.vue";

const {can, rules} = useAbility()


const userState = useUserStore();
const response = ref({});

const breadcrumb = useBreadcrumbStore();

breadcrumb.setLinks([
  {
    link: '/',
    title: 'Home'
  },
  {
    link: {
      name: 'settings.base'
    },
    title: 'Settings'
  },
  {
    link: {
      name: 'settings.company'
    },
    title: 'Company'
  },
  {
    link: {
      name: 'settings.users'
    },
    title: 'Users'
  },
  {
    title: 'List'
  },

])

watch(() => userState.company, () => {
  if (userState.company.id) {

    axios.get(`/api/v1/company/users/${userState.company.id}`).then(res => {
      response.value = res.data;
    });
  }
}, {
  immediate: true,
  deep: true
})
</script>

<template>
      <fwb-table hoverable>
        <fwb-table-head>
          <fwb-table-head-cell></fwb-table-head-cell>
          <fwb-table-head-cell>Name</fwb-table-head-cell>
          <fwb-table-head-cell>Email</fwb-table-head-cell>
          <fwb-table-head-cell></fwb-table-head-cell>
        </fwb-table-head>
        <fwb-table-body>
          <fwb-table-row v-for="obj in response.data" :key="obj.id + userState.onlineUsers">

            <fwb-table-cell>
              <UserIcon :user="obj"/>
            </fwb-table-cell>

            <fwb-table-cell>
              {{ obj.name }}
            </fwb-table-cell>
            <fwb-table-cell>
              {{ obj.email }}
            </fwb-table-cell>
            <fwb-table-cell>
            </fwb-table-cell>
          </fwb-table-row>
        </fwb-table-body>
      </fwb-table>
</template>

<style scoped>

</style>
