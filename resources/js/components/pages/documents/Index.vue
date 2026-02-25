<script setup>
import { useDocumentsStore } from '@/store/documentsStore.js'
import DocumentPrintTree from '@/components/pages/project/documents/partials/DocumentPrintTree.vue'
import { useBreadcrumbStore } from '@/store/breadcrumb'
import Auth from '@/components/layouts/Auth.vue'
import { onMounted, provide } from 'vue'
import { useRouter } from 'vue-router'
import { useAbility } from '@casl/vue'

const { can } = useAbility()
const store = useDocumentsStore()
const breadcrumbStore = useBreadcrumbStore()
const router = useRouter()

breadcrumbStore.addEntry([{ title: 'Documents' }])

provide('fileStore', store)
provide('canCreateDocument', (entityId) => {
    if (!entityId) return true // personal documents — no project restriction
    return can(`can-create-document.${entityId}`, '')
})
provide('canDeleteDocument', (entityId) => {
    if (!entityId) return true
    return can(`can-delete-document.${entityId}`, '')
})

provide('navigateToDocument', (id) => {
    router.push({ name: 'documents.editor', params: { id } })
})

provide('createItem', ({ type, title, parent_id, entityId, entityType, url }) => {
    const data = {
        title,
        type,
        parent_id,
        entity_id: entityId ?? null,
        entity_type: entityType ?? null,
    }
    if (url) data.url = url
    return axios.post('/api/v1/files', data).then(() => store.loadDocuments())
})

onMounted(() => store.loadDocuments())
</script>

<template>
    <Auth>
        <div class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">

            <!-- Header with search -->
            <div class="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/40 px-4 py-2">
                <div class="flex items-center gap-3 flex-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                    <div class="w-3.5 flex-shrink-0" />
                    <div class="w-5 flex-shrink-0" />
                    <div class="flex-1">Name</div>
                    <div class="hidden sm:block w-24 text-right">ID</div>
                    <div class="hidden md:block w-28 text-right">Last edited</div>
                    <div class="w-16 flex-shrink-0" />
                </div>
                <div class="relative flex-shrink-0 w-48">
                    <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        v-model="store.search"
                        type="text"
                        placeholder="Search..."
                        class="w-full pl-8 pr-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
            </div>

            <DocumentPrintTree :parent_id="null" :root="true" />
        </div>
    </Auth>
</template>
