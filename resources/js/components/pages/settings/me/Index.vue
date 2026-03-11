<script setup>
import Settings from '@/components/layouts/Settings.vue'
import Button from '@/components/shared/Button.vue'
import Card from '@/components/shared/Card.vue'
import ChangePassword from '@/components/pages/settings/me/partials/ChangePassword.vue'
import BaseProfile from '@/components/pages/settings/me/partials/BaseProfile.vue'
import { useBreadcrumbStore } from '@/store/breadcrumb'
import ProfilePicture from '@/components/pages/settings/me/partials/ProfilePicture.vue'
import DeleteAccount from '@/components/pages/settings/me/partials/DeleteAccount.vue'
import VacationStats from '@/components/pages/settings/me/partials/VacationStats.vue'
import NotificationSettings from '@/components/pages/settings/me/partials/NotificationSettings.vue'

const breadcrumb = useBreadcrumbStore()

breadcrumb.setLinks([
  {
    link: '/',
    title: 'Home',
  },
  {
    link: {
      name: 'settings.base',
    },
    title: 'Settings',
  },
  {
    link: {
      name: 'settings.base',
    },
    title: 'Profile Settings',
  },
])
</script>

<template>
  <Settings>
    <div class="w-full flex flex-col gap-6 mb-4">
      <!-- Profile: avatar + basic info combined -->
      <Card>
        <div class="p-6">
          <h2 class="text-base font-semibold text-gray-900 dark:text-white mb-5">Profile</h2>
          <div class="flex flex-col sm:flex-row gap-6">
            <ProfilePicture />
            <div class="flex-1 min-w-0">
              <BaseProfile />
            </div>
          </div>
        </div>
      </Card>

      <!-- Change password -->
      <Card>
        <div class="p-6">
          <h2 class="text-base font-semibold text-gray-900 dark:text-white mb-5">Change Password</h2>
          <ChangePassword />
        </div>
      </Card>

      <!-- Vacation balance -->
      <Card>
        <div class="p-6">
          <VacationStats />
        </div>
      </Card>

      <!-- Notifications -->
      <NotificationSettings />

      <!-- Danger zone -->
      <div class="border border-red-200 dark:border-red-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
        <div class="p-6">
          <h2 class="text-base font-semibold text-red-600 dark:text-red-400 mb-5">Danger Zone</h2>
          <DeleteAccount />
        </div>
      </div>
    </div>
  </Settings>
</template>
