<script setup>
import Modal from "../../../../shared/Modal.vue";
import {FwbButton, FwbCheckbox} from "flowbite-vue";
import {ref, watch} from "vue";
import {useRoleStore} from "../../../../../store/roleStore.js";
import {toast} from "vue3-toastify";
const roleStore = useRoleStore();

const permissions = ref([]);
const selected = ref({})
const modalRef = ref(null);

const load = () => {
    axios.get('/api/v1/permissions').then((res) => permissions.value = res.data)
}

const save = () => {
    axios.put(`/api/v1/roles/${roleStore.role.id}`, {
        permissions: Object.keys(selected.value).filter(item => selected.value[item])
    }).then(() => {
        modalRef.value.toggleModal();
        roleStore.loadRoleData();
        toast.success(`Permissions updated for ${roleStore.role.title} role`, {theme: localStorage.getItem('color-theme') ?? 'light'})

    })
}

watch(() =>  roleStore.role, () => {
    roleStore.role.definitions.forEach((obj) => {
        selected.value[obj.id] = true;
    })
}, {
    immediate: true
})
</script>

<template>
    <Modal ref="modalRef">
        <template #header>
            Select permissions for role
        </template>
        <template #button>
            <fwb-button size="xs" @click="load">Manage permissions</fwb-button>
        </template>
        <template #body>
            <div class="mb-1 " v-for="(obj, key) in permissions">
                <div class="uppercase border-b mb-2">
                    {{ key }}
                </div>
                <ul>
                    <li v-for="def in obj" class="hover:underline">
                        <fwb-checkbox :label="def.name" v-model="selected[def.id]"/>
                    </li>
                </ul>
            </div>
        </template>
        <template #footer>
            <fwb-button @click="save">Save</fwb-button>
        </template>
    </Modal>
</template>

<style scoped>

</style>
