<script setup lang="ts">

import InviteModal from "./InviteModal.vue";
import {useAbility} from "@casl/vue";

const {can, rules} = useAbility()
import {useUserStore} from "../../../../../store/user";
import {useBreadcrumbStore} from "../../../../../store/breadcrumb.js";
import {onMounted, ref} from "vue";
import {
  FwbButton,
  FwbTable,
  FwbTableBody,
  FwbTableCell,
  FwbTableHead,
  FwbTableHeadCell,
  FwbTableRow
} from "flowbite-vue";
import {DateTime} from "luxon";
import InteractiveToast from "../../../../shared/InteractiveToast.vue";

const userState = useUserStore();

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
    title: 'Invite'
  },

])

const response = ref({});
const data = () => {
  axios.get('/api/v1/company/invite').then(res => response.value = res.data)

}
onMounted(() => {
  data();
})

const deleteRecord = ({id}) => {
  axios.delete(`/api/v1/company/invite/${id}`)
      .then(() => data());
}

</script>

<template>


    <fwb-table hoverable>
      <fwb-table-head>
        <fwb-table-head-cell>#</fwb-table-head-cell>
        <fwb-table-head-cell>Date</fwb-table-head-cell>
        <fwb-table-head-cell>Available slots / Used slots</fwb-table-head-cell>
        <fwb-table-head-cell class="flex justify-end">
            <InviteModal v-if="can(`can-invite-users.${userState.company.id}`)"
                                          @update:list="data"
        />
        </fwb-table-head-cell>
      </fwb-table-head>
      <fwb-table-body>
        <fwb-table-row v-for="(obj, index) in response.data" :key="obj.id">
          <fwb-table-cell>
            {{ index + 1 }}
          </fwb-table-cell>
          <fwb-table-cell>
            {{ DateTime.fromISO(obj.created_at).toLocaleString() }}
          </fwb-table-cell>
          <fwb-table-cell>
            {{ obj.number_of_invitations }} / {{ obj.registered_count }}
          </fwb-table-cell>
          <fwb-table-cell>
            <InteractiveToast>
              <template #trigger>
                <FwbButton color="red">
                  Delete
                </FwbButton>
              </template>
              <template #title>
                Are you sure?
              </template>

              <template #content>
                You are about to delete invitation link with order number "{{ index + 1 }}"?
              </template>
              <template #actions>
                <fwb-button size="xs" @click="() => deleteRecord(obj)">
                  Yes! Delete it.
                </fwb-button>
              </template>
            </InteractiveToast>
          </fwb-table-cell>
        </fwb-table-row>
      </fwb-table-body>
    </fwb-table>
</template>

<style scoped>

</style>
