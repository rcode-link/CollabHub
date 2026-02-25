<script setup>
import SelectUsersInCompany from "@/components/shared/SelectUsersInCompany.vue";
import { ref, watch } from "vue";
import UserIcon from "@/components/shared/UserIcon.vue";
import InteractiveToast from "@/components/shared/InteractiveToast.vue";
import Modal from "@/components/shared/Modal.vue";
import Button from "@/components/shared/Button.vue";
import { useRoleStore } from "@/store/roleStore";
import { toast } from "vue3-toastify";
const roleStore = useRoleStore();

const userForm = ref(null);
const modalRef = ref(null);
const usersToBeAdded = ref([]);

const save = () => {
    axios
        .put(`/api/v1/roles/${roleStore.role.id}`, {
            users: usersToBeAdded.value.map((obj) => obj.id),
        })
        .then(() => {
            modalRef.value.toggleModal();
            toast.success(`Users added to role ${roleStore.role.title}`, {
                theme: localStorage.getItem("color-theme") ?? "light",
            });

            roleStore.loadRoleData();
        });
};

watch(
    () => modalRef.value?.isShowModal,
    () => {
        usersToBeAdded.value = [];
    }
);

function userSelected(obj) {
    usersToBeAdded.value.push(obj);
    userForm.value = null;
}
</script>

<template>
    <Modal ref="modalRef">
        <template #button>
            <Button size="sm">Add user(s)</Button>
        </template>
        <template #body>
            <SelectUsersInCompany
                v-model="userForm"
                @selected-user="userSelected"
            />
            <div v-if="usersToBeAdded.length" class="mt-3 border-t border-gray-100 dark:border-gray-800 pt-3 space-y-2">
                <div
                    v-for="(obj, index) in usersToBeAdded"
                    :key="obj.id"
                    class="flex justify-between items-center px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                    <div class="flex gap-2 items-center">
                        <UserIcon :user="obj" />
                        <span class="text-sm text-gray-700 dark:text-gray-300">{{ obj.name }}</span>
                    </div>
                    <Button
                        variant="danger"
                        size="sm"
                        @click="() => usersToBeAdded.splice(index, 1)"
                    >
                        Remove
                    </Button>
                </div>
            </div>
        </template>
        <template #footer>
            <Button @click="save">Save</Button>
        </template>
    </Modal>
</template>
