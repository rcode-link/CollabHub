<script setup>

import Label from "../../../../shared/Label.vue";
import Text from "../../../../shared/Text.vue";
import Errors from "../../../../shared/Errors.vue";
import {reactive, watch} from "vue";
import {useUserStore} from "../../../../../store/user";
import Button from "../../../../shared/Button.vue";
import {toast} from "vue3-toastify";

const userStore = useUserStore();
const form = reactive({
    user: {}
})

watch(() => userStore.user, () => {
    form.user = userStore.user;
}, {
    deep: true,
    immediate: true
})

const save = () => {
    axios.put('/api/v1/user', form.user).then(() => toast.success('Profile updated', {theme: localStorage.getItem('color-theme') ?? 'light'}))
}


</script>
<template>
    <form @submit.prevent="save" class="w-full grid gap-6">
        <div>
            <Label :forInput="'email'">Email</Label>
            <Text type="text" v-model="form.user.email" :name="'email'" form="'login'" placeholder="Email"/>
            <Errors name="email"/>
        </div>
        <div>
            <Label :forInput="'email'">Name</Label>
            <Text type="text" v-model="form.user.name" :name="'email'" form="'login'" placeholder="Email"/>
            <Errors name="email"/>
        </div>
        <Button type="submit">Save</Button>
    </form>
</template>
