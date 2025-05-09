<script setup>
import Settings from '../../../layouts/Settings.vue'
import { FwbButton } from 'flowbite-vue'
import Card from '../../../shared/Card.vue'
import ChangePassword from './partials/ChangePassword.vue'
import BaseProfile from './partials/BaseProfile.vue'
import { useBreadcrumbStore } from '../../../../store/breadcrumb'
import ProfilePicture from './partials/ProfilePicture.vue'
import DeleteAccount from './partials/DeleteAccount.vue'
import { ref, onMounted } from 'vue'

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
const askForPermissions = () => {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    console.error('Notifications or Service Workers are not supported.')
    return
  }

  Notification.requestPermission().then(permission => {
    permissionStatus.value = permission
    if (permission === 'granted') {
      navigator.serviceWorker.ready
        .then(function (registration) {
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
      <Card class="flex-col gap-6">
        <h1 class="font-bold text-xl">Basic profile info</h1>
        <BaseProfile />
      </Card>
      <Card class="flex-col gap-6">
        <h1 class="font-bold text-xl">Profile Image</h1>
        <ProfilePicture />
      </Card>
      <Card class="flex-col gap-6">
        <h1 class="font-bold text-xl">Change Password</h1>
        <ChangePassword />
      </Card>
      <Card class="flex-col gap-6">
        <h1 class="font-bold text-xl">Push notificaionts</h1>
        <FwbButton
          v-if="permissionStatus === 'granted'"
          @click="revokePermissions"
          >Disable notificaions
        </FwbButton>
        <FwbButton
          v-if="permissionStatus !== 'granted'"
          @click="askForPermissions"
          >Allow push notificaions
        </FwbButton>
      </Card>

      <Card class="flex-col gap-6" color="bg-gray-100 dark:bg-gray-700">
        <h1 class="font-bold text-xl">Danger zone</h1>
        <DeleteAccount />
      </Card>
    </div>
  </Settings>
</template>

<style scoped></style>
