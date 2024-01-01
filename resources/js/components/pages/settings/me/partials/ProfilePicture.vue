<script setup>

import {onMounted, reactive, watch} from "vue";
import {useUserStore} from "../../../../../store/user.js";
import Button from "../../../../shared/Button.vue";
import {useObjectUrl} from "@vueuse/core";
import useInit from "../../../../../functions/useInit.js";
import {toast} from "vue3-toastify";

const userStore = useUserStore();
const form = reactive({
  avatar: null,
  preview: null,
})


const uploadImage = (event) => {
  form.avatar = event.target.files[0];
  form.preview = useObjectUrl(event.target.files[0]);
}
const submit = () => {

  const formData = new FormData();

  if (form.avatar) {
    formData.append('avatar', form.avatar);
  }

  axios.post(`/api/v1/user/update-profile-picture`, formData).then(() => {
      toast.success(`Profile picture updated`, {theme: localStorage.getItem('color-theme') ?? 'light'})
    useInit();
  })

}

onMounted(() => {
  form.preview = userStore.user.avatar;
})


</script>
<template>
  <form class="w-full grid gap-6" @submit.prevent="submit">
    <div class="w-full grid gap-2 justify-center">
      <input type="file" accept="image/*" @change="uploadImage"/>
      <img :src="form.preview" alt=""
           class="h-auto max-w-full rounded-lg">
    </div>
    <Button type="submit">Save</Button>
  </form>
</template>
