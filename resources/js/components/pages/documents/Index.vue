<script setup>
import { useDocumentsStore } from '@/store/documentsStore.js'
import DocumentPrintTree from '@/components/pages/project/documents/partials/DocumentPrintTree.vue'
import { useBreadcrumbStore } from '@/store/breadcrumb'
import Auth from '@/components/layouts/Auth.vue'
import { onMounted, provide } from 'vue'
import { useRouter } from 'vue-router'

const store = useDocumentsStore()
const breadcrumbStore = useBreadcrumbStore()
const router = useRouter()

breadcrumbStore.addEntry([{ title: 'Documents' }])

provide('fileStore', store)

provide('navigateToDocument', (id) => {
    router.push({ name: 'documents.editor', params: { id } })
})

provide('createItem', ({ type, title, parent_id, entityId, entityType }) => {
    return axios.post('/api/v1/files', {
        title,
        type,
        parent_id,
        entity_id: entityId ?? null,
        entity_type: entityType ?? null,
    }).then(() => store.loadDocuments())
})

onMounted(() => store.loadDocuments())
</script>

<template>
    <Auth>
        <div class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">

            <!-- Column headers -->
            <div class="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/40 px-4 py-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                <div class="w-3.5 flex-shrink-0" />
                <div class="w-5 flex-shrink-0" />
                <div class="flex-1">Name</div>
                <div class="hidden sm:block w-24 text-right">ID</div>
                <div class="hidden md:block w-28 text-right">Last edited</div>
                <div class="w-16 flex-shrink-0" />
            </div>

            <DocumentPrintTree :parent_id="null" :root="true" />
        </div>
    </Auth>
</template>
