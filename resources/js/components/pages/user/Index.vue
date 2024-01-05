<script setup>

import Auth from "../../layouts/Auth.vue";
import {useBreadcrumbStore} from "../../../store/breadcrumb.js";
import {onMounted, ref} from "vue";
import {useRoute} from "vue-router";
import {FwbButton, FwbHeading, FwbImg, FwbP} from "flowbite-vue";
import Card from "../../shared/Card.vue";
import InteractiveToast from "../../shared/InteractiveToast.vue";


const route = useRoute();

const user = ref({});
//
const breadcrumb = useBreadcrumbStore();

const load = () => {
    axios.get(`/api/v1/users/${route.params.id}`).then(res => {
        user.value = res.data.data;
        breadcrumb.setLinks([
            {
                link: '/',
                title: 'Home'
            },
            {
                link: '/',
                title: 'User'
            },
            {
                title: user.value.name
            }

        ])
    });
}
onMounted(() => {
    load();
})

const deleteUser = () => {

}
</script>

<template>
    <Auth>
        <Card class="grid gap-4 grid-cols-4">
            <div>
                <fwb-img alt="" :src="`${user.avatar}`"/>
            </div>
            <div class="col-span-3 flex flex-col">
                <fwb-heading tag="h1">
                    {{ user.name }}
                </fwb-heading>
                <fwb-p>
                    <a :href="`mailto:${user.email}`">{{ user.email }}</a>
                </fwb-p>
                <div class="mt-auto">

                    <interactive-toast>
                        <template #trigger>
                            <fwb-button color="red">Delete</fwb-button>
                        </template>
                        <template #title>
                            You are about to delete user.
                        </template>
                        <template #content>
                            Are you sure you want to delete user:
                            <fwb-p>
                                Name: {{ user.name }}
                            </fwb-p>
                            <fwb-p>
                                Email: {{ user.email }}
                            </fwb-p>
                        </template>
                        <template #actions>
                            <fwb-button color="red" @click="deleteUser" size="xs">Yes, delete</fwb-button>
                        </template>
                    </interactive-toast>
                </div>
            </div>
        </Card>
    </Auth>
</template>

<style scoped>

</style>
