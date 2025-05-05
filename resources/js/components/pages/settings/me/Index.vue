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
const pemissison = ref(false)
onMounted(() => {
  pemissison.value = Notification.permission === 'granted'
})

const askForPermissions = () => {
  if (permission.value === true) {
    return
  }
  Notification.requestPermission().then(permission => {
    // If the user accepts, let's create a notification
    if (permission === 'granted') {
      const notification = new Notification('Hi there!')
      // …
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
        <FwbButton :disabled="permission" @click="askForPermissions"
          >Allow push notificaions</FwbButton
        >
      </Card>

      <Card class="flex-col gap-6" color="bg-gray-100 dark:bg-gray-700">
        <h1 class="font-bold text-xl">Danger zone</h1>
        <DeleteAccount />
      </Card>
    </div>
  </Settings>
</template>

<style scoped></style>
