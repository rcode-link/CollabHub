<script setup>
import { useProjectDocumentsStore } from '@/store/projectDocumentsStore.js'
import DocumentPrintTree from '@/components/pages/project/documents/partials/DocumentPrintTree.vue'
import { useBreadcrumbStore } from '@/store/breadcrumb'
import { onMounted, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAbility } from '@casl/vue'

const { can } = useAbility()
const documentsStore = useProjectDocumentsStore()
const breadcrumbStore = useBreadcrumbStore()
const route = useRoute()
const router = useRouter()

breadcrumbStore.addEntry([{ title: 'Documents' }])

provide('fileStore', documentsStore)
provide('canCreateDocument', can(`can-create-document.${route.params.project}`, ''))
provide('canDeleteDocument', can(`can-delete-document.${route.params.project}`, ''))

provide('navigateToDocument', (id) => {
    router.push({ name: 'project.documents.editor', params: { project: route.params.project, id } })
})

provide('createItem', ({ type, title, parent_id }) => {
    return axios.post('/api/v1/files', {
        title,
        type,
        parent_id,
        entity_id: route.params.project,
        entity_type: 'project',
    }).then(() => documentsStore.loadDocuments())
})

onMounted(() => {
    documentsStore.loadDocuments()
})
</script>

<template>
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
</template>
