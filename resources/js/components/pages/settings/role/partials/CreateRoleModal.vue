<script setup lang="ts">
import Modal from "../../../../shared/Modal.vue";
import { FwbButton } from "flowbite-vue";
import Label from "../../../../shared/Label.vue";
import Text from "../../../../shared/Text.vue";
import { reactive, ref } from "vue";
import { useRoleStore } from "../../../../../store/roleStore";
import { ToastTheme, toast } from "vue3-toastify";

const roleStore = useRoleStore();

const modalRef = ref();
const form = reactive({
    title: "",
});

const submit = () => {
    window.axios.post("/api/v1/roles", form).then(() => {
        modalRef.value?.toggleModal();
        const theme: ToastTheme =
            (localStorage.getItem("color-theme") as ToastTheme) ??
            ("light" as ToastTheme);
        toast.success(`Role created`, {
            theme,
        });

        roleStore.loadRoles();
    });
};

defineExpose({
    modalRef,
});
</script>

<template>
    <Modal ref="modalRef" class="z-99">
        <template #header> Create new role </template>
        <template #body>
            <Label>Role name</Label>
            <Text v-model="form.title" />
        </template>
        <template #footer>
            <fwb-button @click="submit">Save</fwb-button>
        </template>
    </Modal>
</template>

<style scoped></style>
