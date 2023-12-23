<script setup>

import Settings from "../../../layouts/Settings.vue";
import Card from "../../../shared/Card.vue";
import ChangePassword from "./partials/ChangePassword.vue";
import BaseProfile from "./partials/BaseProfile.vue";
import {useBreadcrumbStore} from "../../../../store/breadcrumb.js";
import {ref} from "vue";
import ProfilePicture from "./partials/ProfilePicture.vue";

const html = document.getElementsByTagName('html')[0];
const breadcrumb = useBreadcrumbStore();
const currentTheme = ref(localStorage.getItem('color-theme'));
const changeTheme = () => {

  html.classList.remove(currentTheme.value);

  currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light';

  html.classList.add(currentTheme.value);
  localStorage.setItem('color-theme', currentTheme.value);
}


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
      name: 'settings.base'
    },
    title: 'Profile Settings'
  },

])
</script>

<template>
  <Settings>
    <div class="w-full flex flex-col gap-4">
      <Card class="flex-col gap-6">
        <h1 class="font-bold text-xl">Theme settings</h1>
        <button @click="changeTheme"
                class="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5">
          <svg v-show="currentTheme === 'dark'" id="theme-toggle-dark-icon" class="w-5 h-5" fill="currentColor"
               viewBox="0 0 20 20"
               xmlns="http://www.w3.org/2000/svg">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
          </svg>
          <svg id="theme-toggle-light-icon" v-show="currentTheme === 'light'" class="w-5 h-5" fill="currentColor"
               viewBox="0 0 20 20"
               xmlns="http://www.w3.org/2000/svg">
            <path
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                fill-rule="evenodd" clip-rule="evenodd"></path>
          </svg>
        </button>

      </Card>
      <Card class="flex-col gap-6">
        <h1 class="font-bold text-xl">Basic profile info</h1>
        <BaseProfile/>
      </Card>
      <Card class="flex-col gap-6">
        <h1 class="font-bold text-xl">Profile Image</h1>
        <ProfilePicture/>
      </Card>
      <Card class="flex-col gap-6">
        <h1 class="font-bold text-xl">Change Password</h1>
        <ChangePassword/>
      </Card>

    </div>
  </Settings>
</template>

<style scoped>

</style>
