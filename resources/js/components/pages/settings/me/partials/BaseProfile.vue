<script setup>
import Label from "@/components/shared/Label.vue";
import Text from "@/components/shared/Text.vue";
import Errors from "@/components/shared/Errors.vue";
import { reactive, watch } from "vue";
import { useUserStore } from "@/store/user";
import Button from "@/components/shared/Button.vue";
import { toast } from "vue3-toastify";

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
    axios.put('/api/v1/user', form.user).then(() => toast.success('Profile updated', { theme: localStorage.getItem('color-theme') ?? 'light' }))
}
</script>
<template>
    <form @submit.prevent="save" class="grid gap-4">
        <div>
            <Label forInput="name">Name</Label>
            <Text type="text" v-model="form.user.name" name="name" placeholder="Name"/>
            <Errors name="name"/>
        </div>
        <div>
            <Label forInput="email">Email</Label>
            <Text type="email" v-model="form.user.email" name="email" placeholder="Email"/>
            <Errors name="email"/>
        </div>
        <div>
            <Button type="submit" size="sm">Save</Button>
        </div>
    </form>
</template>
