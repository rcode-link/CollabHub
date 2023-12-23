<script setup>

import Settings from "../../../layouts/Settings.vue";
import {useObjectUrl} from '@vueuse/core'
import {useBreadcrumbStore} from "../../../../store/breadcrumb.js";
import Card from "../../../shared/Card.vue";
import Label from "../../../shared/Label.vue";
import Button from "../../../shared/Button.vue";
import Text from "../../../shared/Text.vue";
import Errors from "../../../shared/Errors.vue";
import {reactive, ref, watch} from "vue";
import {FwbToast} from "flowbite-vue";
import {useUserStore} from "../../../../store/user.js";
import useInit from "../../../../functions/useInit.js";
import {useAbility} from "@casl/vue";
const { can, rules } = useAbility()

const userStore = useUserStore();
const showToast = ref(false);
const form = reactive({
    company: {},
    avatar: null
})

watch(() => userStore.company, () => {
    form.company = userStore.company;
}, {
    deep: true,
    immediate: true
})
const breadcrumb = useBreadcrumbStore();
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
        title: 'Company'
    },

])

const uploadImage = (event) => {
    form.avatar = event.target.files[0];
    form.company.avatar = useObjectUrl(event.target.files[0]);
}


const submit = () => {

    if(!can(`can-update-company.${userStore.company.id}`)){
        return;
    }

    const formData = new FormData();

    formData.append('name', form.company.name);
    if (form.avatar) {
        formData.append('avatar', form.avatar);
    }

    axios.post(`/api/v1/companies/${form.company.id}`, formData).then(() => {
        showToast.value = true;
        useInit();
    })

}
</script>

<template>
    <Settings>
        <fwb-toast v-show="showToast"  @close="() => showToast = false" closable type="success" class="fixed bottom-6 right-6 shadow">
            Company updated!
        </fwb-toast>
        <Card class="col-span-2 flex flex-col gap-4 w-full">
            <form @submit.prevent="submit" class="w-full grid gap-6">
                <div>
                    <Label :forInput="'name'">Company Name</Label>
                    <Text type="text" v-model="form.company.name"
                          :disabled="!can(`can-update-company.${userStore.company.id}`)"
                          :name="'name'" form="'login'" placeholder="Company name"/>
                    <Errors name="name"/>
                </div>
                <div class="w-full grid gap-2 justify-center">
                    <input v-if="can(`can-update-company.${userStore.company.id}`)" type="file" accept="image/*" @change="uploadImage"/>
                    <img :src="form.company.avatar" alt=""
                         class="h-auto max-w-full rounded-lg">
                </div>

                <Button v-if="can(`can-update-company.${userStore.company.id}`)" type="submit">Save</Button>
            </form>
        </Card>
    </Settings>
</template>

<style scoped>

</style>
