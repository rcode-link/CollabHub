<script setup>
import Settings from '@/components/layouts/Settings.vue'
import Button from '@/components/shared/Button.vue'
import Card from '@/components/shared/Card.vue'
import ChangePassword from '@/components/pages/settings/me/partials/ChangePassword.vue'
import BaseProfile from '@/components/pages/settings/me/partials/BaseProfile.vue'
import { useBreadcrumbStore } from '@/store/breadcrumb'
import ProfilePicture from '@/components/pages/settings/me/partials/ProfilePicture.vue'
import DeleteAccount from '@/components/pages/settings/me/partials/DeleteAccount.vue'
import { ref } from 'vue'

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
const permissionStatus = ref(Notification.permission)

const revokePermissions = () => {
  window.alert(
    'To revoke notification permissions, please follow these steps:\n\n' +
      'Chrome:\n' +
      '1. Click on the padlock icon in the address bar.\n' +
      "2. Click on 'Site settings'.\n" +
      "3. Find the 'Notifications' section.\n" +
      "4. Use the dropdown menu to change the permission to 'Block' or 'Ask'.\n\n" +
      'Firefox:\n' +
      '1. Click on the padlock icon in the address bar.\n' +
      "2. Click on 'Permissions'.\n" +
      "3. Find the 'Notifications' section.\n" +
      "4. Use the dropdown menu to change the permission to 'Block' or 'Ask'.\n\n" +
      'Safari:\n' +
      "1. Go to 'Safari' > 'Preferences' > 'Websites' > 'Notifications'.\n" +
      '2. Find the website in the list.\n' +
      "3. Use the dropdown menu to change the permission to 'Deny'.\n\n" +
      'Edge:\n' +
      '1. Click on the padlock icon in the address bar.\n' +
      "2. Click on 'Permissions for this site'.\n" +
      "3. Find the 'Notifications' section.\n" +
      "4. Use the dropdown menu to change the permission to 'Block' or 'Ask'.",
  )
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
const subscribeNotificaion = () => {
  navigator.serviceWorker.ready
    .then(function (registration) {
      console.log(registration)
      return registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          'BFHChgedr72giDXoNxYixadXfFXg9UNSf2iJrI-S3s3TSjZGnuaNHKn6RiTrzt86NbVZTsaFrs4Lq3N11NXKgD8',
        ),
      })
    })
    .then(function (subscription) {
      console.log(subscription)
      const token = localStorage.getItem('token')
      fetch('/api/v1/push-notification', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
    })
}
const askForPermissions = () => {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    console.error('Notifications or Service Workers are not supported.')
    return
  }

  Notification.requestPermission().then(permission => {
    permissionStatus.value = permission
    if (permission === 'granted') {
      navigator.serviceWorker.controller.postMessage({
        type: 'show-notification',
        title: 'Hello!',
        body: 'This is a notification message.',
      })
    } else {
      console.warn('Notification permission not granted.')
    }
  })
}
</script>

<template>
  <Settings>
    <div class="w-full flex flex-col gap-4 mb-4">
      <Card>
        <div class="p-5 space-y-4">
          <h2 class="text-base font-semibold text-gray-900 dark:text-white">Basic profile info</h2>
          <BaseProfile />
        </div>
      </Card>
      <Card>
        <div class="p-5 space-y-4">
          <h2 class="text-base font-semibold text-gray-900 dark:text-white">Profile Image</h2>
          <ProfilePicture />
        </div>
      </Card>
      <Card>
        <div class="p-5 space-y-4">
          <h2 class="text-base font-semibold text-gray-900 dark:text-white">Change Password</h2>
          <ChangePassword />
        </div>
      </Card>
      <Card>
        <div class="p-5 space-y-4">
          <h2 class="text-base font-semibold text-gray-900 dark:text-white">Push Notifications</h2>
          <div class="flex gap-2">
            <Button
              v-if="permissionStatus === 'granted'"
              variant="soft"
              @click="revokePermissions"
            >
              Disable notifications
            </Button>
            <Button
              v-if="permissionStatus !== 'granted'"
              @click="askForPermissions"
            >
              Allow push notifications
            </Button>
            <Button
              v-if="permissionStatus === 'granted'"
              @click="subscribeNotificaion"
            >
              Subscribe
            </Button>
          </div>
        </div>
      </Card>

      <div class="border border-red-200 dark:border-red-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
        <div class="p-5 space-y-4">
          <h2 class="text-base font-semibold text-red-600 dark:text-red-400">Danger zone</h2>
          <DeleteAccount />
        </div>
      </div>
    </div>
  </Settings>
</template>
