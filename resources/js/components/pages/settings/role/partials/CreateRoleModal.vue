<script setup>

import Modal from "../../../../shared/Modal.vue";
import {FwbButton} from "flowbite-vue";
import Label from "../../../../shared/Label.vue";
import Text from "../../../../shared/Text.vue";
import {reactive, ref} from "vue";
import {useRoleStore} from "../../../../../store/roleStore.js";

const roleStore = useRoleStore();

const modalRef = ref(null);
const form = reactive({
    title: ''
});

const submit = () => {
    axios.post('/api/v1/roles', form).then(() => {
        modalRef.value.toggleModal();
        roleStore.loadRoles()
    })
}

defineExpose({
    modalRef
})

</script>

<template>
<Modal ref="modalRef">
    <template #header>
        Create new role
    </template>
    <template #body>
        <Label>Role name</Label>
        <Text v-model="form.title" />
    </template>
    <template #footer>
        <fwb-button @click="submit">Save</fwb-button>
    </template>
</Modal>
</template>

<style scoped>

</style>
