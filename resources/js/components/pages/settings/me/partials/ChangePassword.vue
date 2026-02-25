<script setup>

import Label from "@/components/shared/Label.vue";
import Text from "@/components/shared/Text.vue";
import Errors from "@/components/shared/Errors.vue";
import {reactive} from "vue";
import Button from "@/components/shared/Button.vue";
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
            <Label forInput="current_password">Current Password</Label>
            <Text type="password" v-model="form.current_password" name="current_password" placeholder="Current Password"/>
            <Errors name="current_password"/>
        </div>
        <div>
            <Label forInput="password">New Password</Label>
            <Text type="password" v-model="form.password" name="password" placeholder="New Password"/>
            <Errors name="password"/>
        </div>
        <div>
            <Label forInput="password_confirmation">Confirm new Password</Label>
            <Text type="password" v-model="form.password_confirmation" name="password_confirmation"
                  placeholder="Confirm Password"/>
            <Errors name="password_confirmation"/>
        </div>
        <Button type="submit">Save</Button>
    </form>
</template>
