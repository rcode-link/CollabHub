<script setup>

import {FwbButton} from "flowbite-vue";
import SelectUsersInCompany from "../../../../shared/SelectUsersInCompany.vue";
import {reactive, ref, watch} from "vue";
import UserIcon from "../../../../shared/UserIcon.vue";
import InteractiveToast from "../../../../shared/InteractiveToast.vue";
import Modal from "../../../../shared/Modal.vue";
import {useRoleStore} from "../../../../../store/roleStore.js";
import {toast} from "vue3-toastify";
const roleStore = useRoleStore();

const userForm = ref(null);
const modalRef = ref(null);
const usersToBeAdded = ref([]);

const save = () => {
    axios.put(`/api/v1/roles/${roleStore.role.id}`, {
        users: usersToBeAdded.value.map(obj => obj.id)
    }).then(() => {
        modalRef.value.toggleModal();
        toast.success(`Users added to role ${roleStore.role.title}`, {theme: localStorage.getItem('color-theme') ?? 'light'})

        roleStore.loadRoleData();
    })
}

watch(() => modalRef.value?.isShowModal, () => {
    usersToBeAdded.value = [];
})

function userSelected(obj) {
    usersToBeAdded.value.push(obj)
    userForm.value = null;
}</script>

<template>
    <Modal ref="modalRef">
        <template #button>
            <fwb-button size="xs">Add user(s)</fwb-button>
        </template>
        <template #body>
            <SelectUsersInCompany v-model="userForm" @selected-user="userSelected"/>
            <hr class="mt-1 mb-1">
            <div v-for="(obj, index) in usersToBeAdded" class="flex justify-between items-center">
                <div class="flex gap-1 items-center">
                    <UserIcon :user="obj"/>
                    {{ obj.name }}
                </div>
                <div>
                    <InteractiveToast>
                        <template #trigger>
                            <fwb-button color="red">Remove</fwb-button>
                        </template>
                        <template #content>
                            You are about to remove added user, are you sure?
                        </template>
                        <template #actions>
                            <fwb-button @click="() => usersToBeAdded.splice(index, 1)" size="xs">Yes, remove it!
                            </fwb-button>
                        </template>
                    </InteractiveToast>
                </div>
            </div>
        </template>
        <template #footer>
            <div class="flex">
                <fwb-button @click="save">Save</fwb-button>
            </div>
        </template>
    </Modal>
</template>

<style scoped>

</style>
