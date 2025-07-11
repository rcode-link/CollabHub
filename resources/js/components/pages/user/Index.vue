<script setup>
import Auth from '../../layouts/Auth.vue'
import { onMounted } from 'vue'
import {
  FwbListGroup,
  FwbListGroupItem,
  FwbHeading,
  FwbAvatar,
  FwbImg,
  FwbP,
} from 'flowbite-vue'
import Card from '../../shared/Card.vue'
import { useAbility } from '@casl/vue'
import { useUserStore } from '../../../store/user'
import AdminView from './partials/AdminView.vue'
import { useSingleUserStore } from '../../../store/singleUser'
import UserInResources from './UserInResources.vue'

const { can, rules } = useAbility()
const userStore = useUserStore()

const singleUserStore = useSingleUserStore()

onMounted(() => {
  singleUserStore.load()
})
</script>

<template>
  <Auth>
    <div v-if="singleUserStore.user" class="grid md:gap-4 md:grid-cols-3">
      <div>
        <Card class="w-full justify-center">
          <fwb-avatar size="xl" :img="`${singleUserStore.user.avatar}`" />
        </Card>
        <fwb-list-group class="w-full mt-2">
          <fwb-list-group-item>
            <fwb-heading tag="h5">
              {{ singleUserStore.user.name }}
              <small class="text-sm">
                {{
                  singleUserStore.user.deleted_at &&
                  singleUserStore.user.name !== 'deleted_user'
                    ? '(deactivated)'
                    : ''
                }}
              </small>
            </fwb-heading>
          </fwb-list-group-item>
          <fwb-list-group-item>
            <a :href="`mailto:${singleUserStore.user.email}`">{{
              singleUserStore.user.email
            }}</a>
          </fwb-list-group-item>
          <fwb-list-group-item>
            <fwb-p>
              Work time from:
              <br />
              <b
                >{{ singleUserStore.user.start_work_time ?? '00:00' }} to:
                {{ singleUserStore.user.end_work_time ?? '00:00' }}</b
              >
            </fwb-p>
          </fwb-list-group-item>
        </fwb-list-group>
      </div>
      <div class="col-span-2 flex flex-col gap-4">
        Resources:
        <fwb-list-group class="w-full">
          <UserInResources
            v-for="obj in singleUserStore.user.view_profile"
            :obj="obj"
            :key="obj"
          />
        </fwb-list-group>
        <AdminView
          class="mt-auto"
          v-if="can(`can-delete-users.${userStore.company.id}`, '')"
        />
      </div>
    </div>
  </Auth>
</template>
