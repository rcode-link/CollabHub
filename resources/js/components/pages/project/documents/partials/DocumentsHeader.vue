<script setup>

import PlusSquare from "../../../../shared/icons/PlusSquare.vue";
import {FwbButton, FwbDropdown, FwbListGroup, FwbListGroupItem, FwbSelect} from "flowbite-vue";
import {useRoute} from "vue-router";
import Modal from "../../../../shared/Modal.vue";
import {ref} from "vue";
import Text from "../../../../shared/Text.vue";
import {useProjectDocumentsStore} from "../../../../../store/projectDocumentsStore.js";
import Label from "../../../../shared/Label.vue";

const documentsStore = useProjectDocumentsStore();

const route = useRoute();
const modalRef = ref();
const form = {
    title: '',
    'type': '',
    parent_id: null,
    'entity_id': route.params.project,
    'entity_type': 'project'
}
const addItem = () => {
  axios.post('/api/v1/files', form).then(() => {
        documentsStore.loadDocuments();
        modalRef.value.toggleModal();
    })

}
const openModal = (type) => {
    form.type = type;
    modalRef.value.toggleModal();
}
</script>

<template>
    <div class="flex justify-between w-full">
        <h1>Documents</h1>
        <fwb-dropdown text="Bottom" placement="left">
            <template #trigger>
                <PlusSquare class="w-4 h-4 hover:text-blue-300"/>
            </template>
            <fwb-list-group>
                <fwb-list-group-item @click="() => openModal('file')">
                    Add document
                </fwb-list-group-item>
                <fwb-list-group-item @click="() => openModal('folder')">
                    Add folder
                </fwb-list-group-item>

            </fwb-list-group>
        </fwb-dropdown>
    </div>
    <Modal ref="modalRef">
        <template #header>
            <h1 v-if="form.type === 'file'">
                Create new document
            </h1>
            <h1 v-if="form.type === 'folder'">
                Create new folder
            </h1>
        </template>
        <template #body>
          <Label>Document name</Label>
            <Text v-model="form.title"/>
          <Label>Parent</Label>
            <fwb-select v-model="form.parent_id"
                        :options="documentsStore.getDocuments.filter(obj => obj.type === 'folder').map(obj => {
                            return {
                                       value: obj.id, name: obj.title
                            }
                        })"
            />
        </template>
        <template #footer>
            <fwb-button @click="addItem">
                Save
            </fwb-button>
        </template>
    </Modal>
</template>

<style scoped>

</style>
