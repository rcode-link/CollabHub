<script setup>

import Label from "../../../../shared/Label.vue";
import Text from "../../../../shared/Text.vue";
import Errors from "../../../../shared/Errors.vue";
import {onMounted, reactive} from "vue";
import {useUserStore} from "../../../../../store/user.js";
import Button from "../../../../shared/Button.vue";

const form = reactive({
    current_password: '',
    password: '',
    password_confirmed: ''
})

const submit = () => {
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
            <Text type="text" v-model="form.password" :name="'password'" form="'login'" placeholder="New Password"/>
            <Errors name="password"/>
        </div>
        <div>
            <Label :forInput="'password_confirmed'">Confirm new Password</Label>
            <Text type="text" v-model="form.password_confirmed" :name="'password_confirmed'" form="'login'" placeholder="Confirm Password"/>
            <Errors name="password_confirmed"/>
        </div>
        <Button type="submit">Save</Button>
    </form>
</template>
