<script setup>
import { reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectDocumentsStore } from '@/store/projectDocumentsStore.js'
import { FwbButton } from 'flowbite-vue'
import Modal from '@/components/shared/Modal.vue'
import Label from '@/components/shared/Label.vue'
import Text from '@/components/shared/Text.vue'

const documentsStore = useProjectDocumentsStore()
const route = useRoute()
const modalRef = ref()

const form = reactive({
    title: '',
    type: '',
    parent_id: null,
    entity_id: route.params.project,
    entity_type: 'project',
})

const openModal = (type) => {
    form.type = type
    form.title = ''
    form.parent_id = null
    modalRef.value.toggleModal()
}

const addItem = () => {
    if (!form.title.trim()) return
    axios.post('/api/v1/files', { ...form }).then(() => {
        documentsStore.loadDocuments()
        modalRef.value.toggleModal()
    })
}

const folders = () => documentsStore.getDocuments.filter(d => d.type === 'folder')
</script>

<template>
    <div class="flex items-center justify-between">
        <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Documents</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {{ documentsStore.getDocuments.length }} item{{ documentsStore.getDocuments.length !== 1 ? 's' : '' }}
            </p>
        </div>

        <div class="flex gap-2">
            <button
                @click="openModal('folder')"
                class="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm transition hover:bg-gray-50 dark:hover:bg-gray-600"
            >
                <!-- Folder icon -->
                <svg class="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                </svg>
                New folder
            </button>
            <button
                @click="openModal('file')"
                class="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-500"
            >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                New document
            </button>
        </div>
    </div>

    <Modal ref="modalRef">
        <template #header>
            <h2 class="text-base font-semibold">
                {{ form.type === 'file' ? 'New document' : 'New folder' }}
            </h2>
        </template>
        <template #body>
            <div class="space-y-4">
                <div>
                    <Label>Name</Label>
                    <Text v-model="form.title" :placeholder="form.type === 'file' ? 'Document name…' : 'Folder name…'" />
                </div>
                <div v-if="folders().length">
                    <Label>Parent folder <span class="text-gray-400 font-normal">(optional)</span></Label>
                    <select
                        v-model="form.parent_id"
                        class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option :value="null">— No parent —</option>
                        <option v-for="f in folders()" :key="f.id" :value="f.id">{{ f.title }}</option>
                    </select>
                </div>
            </div>
        </template>
        <template #footer>
            <fwb-button @click="addItem" :disabled="!form.title.trim()">
                Create
            </fwb-button>
        </template>
    </Modal>
</template>
