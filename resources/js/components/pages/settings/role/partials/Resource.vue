<script setup>

import Card from "../../../../shared/Card.vue";
import {FwbButton, FwbHeading, FwbSelect} from "flowbite-vue";
import Label from "../../../../shared/Label.vue";
import {reactive, ref, watch} from "vue";
import {useRoute} from "vue-router";
import {useRoleStore} from "../../../../../store/roleStore.js";
import {toast} from "vue3-toastify";

const roleStore = useRoleStore();
const model = reactive({
    'resource_type': null,
    'resource': null
})


const resources = ref();
const list = ref();

const loadCompany = () => {
    axios.get('/api/v1/role/resources', {
        params: model
    }).then(obj => resources.value = obj.data);
}

watch(() => model.resource_type, () => {
    loadCompany();
}, {
    deep: true
})
const load = () => {
    axios.get(`/api/v1/role/resources/${roleStore.activeRole}`).then(res => list.value = res.data);
}
const save = () => {
    axios.post(`/api/v1/role/resources/${roleStore.activeRole}`, model).then(() => {
        toast.success(`New resource added to ${roleStore.role.title} role`, {theme: localStorage.getItem('color-theme') ?? 'light'})
    })
}

load();
</script>

<template>
    <Card class="flex-col">
        <fwb-heading tag="h6">Add resource to role</fwb-heading>
        <form @submit.prevent="save">
            <div class="mb-4">
                <Label>Type</Label>
                <fwb-select
                    v-model="model.resource_type"
                    :options="[
                        {
                            name: 'Company',
                            value: 'company'
                        },
                         {
                            name: 'Project',
                            value: 'project'
                        }
                    ]"
                />
            </div>
            <div class="mb-4">
                <Label>Resource</Label>
                <fwb-select
                    v-model="model.resource"
                    :options="resources"
                />
            </div>
            <fwb-button>Save</fwb-button>
        </form>
    </Card>

    <Card v-for="obj in list">
        {{ obj.resourcable?.name }}
    </Card>
</template>

<style scoped>

</style>
