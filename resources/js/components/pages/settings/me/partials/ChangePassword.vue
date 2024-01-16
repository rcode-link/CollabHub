<script setup lang="ts">

import Label from "../../../../shared/Label.vue";
import Text from "../../../../shared/Text.vue";
import Errors from "../../../../shared/Errors.vue";
import {reactive} from "vue";
import Button from "../../../../shared/Button.vue";
import {toast} from "vue3-toastify";

const form = reactive({
    current_password: '',
    password: '',
    password_confirmation: ''
})

const submit = () => {
    axios.put('/api/v1/user/change-password', form).then(() => {
        form.current_password = '';
        form.password = '';
        form.password_confirmation = '';
        toast.success('Password changed');
    });
}

</script>
<template>
    <form @submit.prevent="submit" class="w-full grid gap-6">
        <div>
            <Label :forInput="'email'">Current Password</Label>
            <Text type="password" v-model="form.current_password" :name="'current_password'" form="'login'" placeholder="Current Password"/>
            <Errors name="current_password"/>
        </div>
        <div>
            <Label :forInput="'password'">New Password</Label>
            <Text type="password" v-model="form.password" :name="'password'" form="'login'" placeholder="New Password"/>
            <Errors name="password"/>
        </div>
        <div>
            <Label :forInput="'password_confirmation'">Confirm new Password</Label>
            <Text type="password" v-model="form.password_confirmation" :name="'password_confirmation'" form="'login'"
                  placeholder="Confirm Password"/>
            <Errors name="password_confirmation"/>
        </div>
        <Button type="submit">Save</Button>
    </form>
</template>
