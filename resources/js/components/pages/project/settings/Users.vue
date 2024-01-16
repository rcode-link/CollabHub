<script setup lang="ts">

import {FwbTable, FwbTableBody, FwbTableCell, FwbTableHead, FwbTableHeadCell, FwbTableRow} from "flowbite-vue";
import UserIcon from "../../../shared/UserIcon.vue";
import {onMounted, ref} from "vue";
import {useRoute} from "vue-router";

const route = useRoute();
const users = ref({
  data: []
})

const load = () => {
  // axios.get(`/api/v1/users/project`, {
  //   params: {
  //     'project_id': route.params.project
  //   }
  // }).then(res => {
  //   users.value = res.data;
  // });
}
onMounted(() => {
  load();
})
</script>

<template>
  <fwb-table hoverable>
    <fwb-table-head>
      <fwb-table-head-cell></fwb-table-head-cell>
      <fwb-table-head-cell>Name</fwb-table-head-cell>
      <fwb-table-head-cell>Email</fwb-table-head-cell>
      <fwb-table-head-cell class="text-right"></fwb-table-head-cell>
    </fwb-table-head>
    <fwb-table-body>
      <fwb-table-row v-for="obj in users.data" :key="obj.id">
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
