<script setup>
import Auth from '@/components/layouts/Auth.vue'
import { onMounted } from 'vue'
import Card from '@/components/shared/Card.vue'
import { useAbility } from '@casl/vue'
import { useUserStore } from '@/store/user'
import VacationInfo from '@/components/pages/user/partials/VacationInfo.vue'
import { useSingleUserStore } from '@/store/singleUser'
import UserInResources from '@/components/pages/user/UserInResources.vue'
import SelectManager from '@/components/pages/user/partials/partials/SelectManager.vue'
import DeleteUser from '@/components/pages/user/partials/partials/DeleteUser.vue'
import DeactivateUser from '@/components/pages/user/partials/partials/DeactivateUser.vue'
import RestoreUser from '@/components/pages/user/partials/partials/RestoreUser.vue'

const { can } = useAbility()
const userStore = useUserStore()
const singleUserStore = useSingleUserStore()

onMounted(() => {
  singleUserStore.load()
})

const isAdmin = can(`can-delete-users.${userStore.company.id}`, '')
</script>

<template>
  <Auth>
    <div v-if="singleUserStore.user" class="flex flex-col md:flex-row gap-4">
      <!-- Left column -->
      <div class="md:w-1/4 flex-shrink-0 flex flex-col gap-4">
        <!-- User Info -->
        <Card>
          <div class="flex flex-col items-center p-6">
            <img
              :src="singleUserStore.user.avatar"
              :alt="singleUserStore.user.name"
              class="w-24 h-24 rounded-full object-cover mb-3"
            />
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ singleUserStore.user.name }}
            </h3>
            <a
              :href="`mailto:${singleUserStore.user.email}`"
              class="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1"
            >
              {{ singleUserStore.user.email }}
            </a>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-3">
              Work time:
              <span class="font-medium text-gray-700 dark:text-gray-300">
                {{ singleUserStore.user.start_work_time ?? '00:00' }} — {{ singleUserStore.user.end_work_time ?? '00:00' }}
              </span>
            </p>

            <!-- Manager -->
            <div class="mt-4 w-full max-w-sm">
              <template v-if="isAdmin && !singleUserStore.loading">
                <SelectManager />
              </template>
              <template v-else-if="singleUserStore.user.manager">
                <div class="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <svg class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Manager: <span class="font-medium text-gray-700 dark:text-gray-300">{{ singleUserStore.user.manager.name }}</span></span>
                </div>
              </template>
            </div>
          </div>
        </Card>

        <!-- Danger Zone (admin only) -->
        <div
          v-if="isAdmin && !singleUserStore.loading"
          class="border border-red-200 dark:border-red-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900"
        >
          <div class="p-6">
            <h2 class="text-base font-semibold text-red-600 dark:text-red-400 mb-4">Danger Zone</h2>
            <div class="flex flex-wrap gap-3" v-if="!singleUserStore.user?.deleted_at">
              <DeactivateUser />
              <DeleteUser />
            </div>
            <div v-if="singleUserStore.user?.deleted_at && singleUserStore.user?.name !== 'deleted_user'">
              <RestoreUser />
            </div>
          </div>
        </div>
      </div>

      <!-- Right column -->
      <div class="flex-1 flex flex-col gap-4">
        <!-- Resources & Access -->
        <Card v-if="singleUserStore.user.view_profile?.length">
          <div class="p-5">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">Resources & Access</h3>
            <div class="space-y-0.5">
              <UserInResources
                v-for="obj in singleUserStore.user.view_profile"
                :obj="obj"
                :key="obj.id ?? obj.name"
              />
            </div>
          </div>
        </Card>

        <!-- Vacation Overview -->
        <VacationInfo
          v-if="can(`can-approve-vacation.${userStore.company.id}`, '')"
          :user-id="singleUserStore.user.id"
        />
      </div>
    </div>
  </Auth>
</template>
