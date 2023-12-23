<template>
    <div class="flex h-screen justify-center items-center">
        <div class="w-full">
            <Card class="max-w-lg m-auto">
                <form @submit.prevent="login" class="w-full grid gap-6">
                    <h2 class="text-3xl font-bold">Login</h2>
                    <DangerAlert v-if="globalErrorMessage !== ''">
                        {{ globalErrorMessage}}
                    </DangerAlert>
                    <div>
                        <Label :forInput="'email'">Email</Label>
                        <Text type="text" v-model="form.email" :name="'email'" form="'login'" placeholder="Email"/>
                        <Errors name="email"/>
                    </div>
                    <div>
                        <Label :forInput="'password'">Password</Label>
                        <Text type="password" v-model="form.password" placeholder="Password"
                              :name="'password'"/>
                        <Errors name="password"/>
                    </div>

                    <div class="card-actions justify-end">
                        <Button type="submit" class="btn btn-primary">Login</Button>
                    </div>
                </form>
            </Card>
        </div>
    </div>
</template>
<script setup>

import {onMounted, reactive, ref} from "vue";
import Text from "../shared/Text.vue";
import {useErrorsStore} from "../../store/errors.js";
import Errors from "../shared/Errors.vue";
import {useRouter} from "vue-router";
import Card from "../shared/Card.vue";
import Label from '../shared/Label.vue'
import Button from "../shared/Button.vue";
import DangerAlert from "../shared/DangerAlert.vue";
import useInit from "../../functions/useInit.js";

const router = useRouter();

const errorsStore = useErrorsStore();
const globalErrorMessage = ref('');
const form = reactive({
    email: null,
    password: null
})

onMounted(() => {
    if(localStorage.getItem('token')){
        router.push({
            name: 'home'
        })
    }
})

const login = () => {
    errorsStore.setErrors({});
    axios.post('/api/v1/login', form)
        .then(response => {
            localStorage.setItem('token', response.data.data.plainTextToken)
            useInit();

            router.push({
                name: 'home'
            })
        })
        .catch((error) => {
            if (error.response.status === 422) {
                errorsStore.setErrors(error.response.data.errors, 'login')
                return;
            }
            globalErrorMessage.value = error.response.data.data;
        })
}

</script>
