<script setup>
import { ref, computed } from 'vue'
import AdvancedEditor from '../../shared/advancedEditor/Index.vue'
import Auth from '../../layouts/Auth.vue'
import { useRoute } from 'vue-router'
import { useBreadcrumbStore } from '../../../store/breadcrumb'
import InteractiveToast from '../../shared/InteractiveToast.vue'
import { DateTime } from 'luxon'

const document = ref({})
const saving = ref(false)
const route = useRoute()
const breadcrumbStore = useBreadcrumbStore()
const toast = ref(null)

const relativeTime = computed(() =>
    document.value.updated_at
        ? DateTime.fromISO(document.value.updated_at).toRelative()
        : null
)

const load = () => {
    axios.get(`/api/v1/files/${route.params.id}`).then((response) => {
        document.value = response.data
        breadcrumbStore.addEntry([
            { link: { name: 'documents' }, title: 'Documents' },
            { title: response.data.title },
        ])
    })
}

const save = () => {
    saving.value = true
    axios.put(`/api/v1/files/${route.params.id}`, {
        title: document.value.title,
        content: document.value.content,
    }).then(() => {
        document.value.updated_at = new Date().toISOString()
        toast.value.showToastFn()
    }).finally(() => {
        saving.value = false
    })
}

load()
</script>

<template>
    <Auth>
        <div class="notion-page">
            <!-- Meta bar -->
            <div class="notion-meta">
                <span v-if="document.file_id" class="notion-file-id">{{ document.file_id }}</span>
                <span v-if="relativeTime" class="notion-timestamp">Edited {{ relativeTime }}</span>
                <div class="notion-meta-right">
                    <span v-if="saving" class="notion-saving">Saving…</span>
                    <span v-else class="notion-shortcut">
                        <kbd>Ctrl</kbd>+<kbd>Enter</kbd> to save
                    </span>
                </div>
            </div>

            <!-- Title -->
            <input
                v-model="document.title"
                class="notion-title"
                placeholder="Untitled"
            />

            <!-- Editor -->
            <AdvancedEditor
                :key="document.id"
                v-model="document.content"
                :editable="true"
                :notion="true"
                @submitted="save"
            />
        </div>

        <InteractiveToast ref="toast" type="green">
            <template #title><h1>Saved</h1></template>
            <template #content>Document saved</template>
        </InteractiveToast>
    </Auth>
</template>

<style scoped>
.notion-page {
    max-width: 720px;
    margin: 0 auto;
    width: 100%;
    padding-top: 2rem;
}

.notion-meta {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    min-height: 1.25rem;
}

.notion-file-id {
    font-family: ui-monospace, monospace;
    font-size: 0.7rem;
    color: #6b7280;
    background: #f3f4f6;
    border-radius: 0.25rem;
    padding: 0.1rem 0.4rem;
}

:global(.dark) .notion-file-id {
    background: #374151;
    color: #9ca3af;
}

.notion-timestamp {
    font-size: 0.75rem;
    color: #9ca3af;
}

.notion-meta-right {
    margin-left: auto;
}

.notion-saving {
    font-size: 0.75rem;
    color: #3b82f6;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

.notion-shortcut {
    font-size: 0.7rem;
    color: #d1d5db;
}

.notion-shortcut kbd {
    border: 1px solid #e5e7eb;
    border-radius: 0.2rem;
    padding: 0.05rem 0.3rem;
    font-family: ui-monospace, monospace;
    font-size: 0.65rem;
}

:global(.dark) .notion-shortcut {
    color: #4b5563;
}

:global(.dark) .notion-shortcut kbd {
    border-color: #374151;
}

.notion-title {
    display: block;
    width: 100%;
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1.2;
    color: #111827;
    background: transparent;
    border: none;
    outline: none;
    margin-bottom: 1.5rem;
    padding: 0;
    caret-color: #111827;
}

:global(.dark) .notion-title {
    color: #f9fafb;
    caret-color: #f9fafb;
}

.notion-title::placeholder {
    color: #d1d5db;
}

:global(.dark) .notion-title::placeholder {
    color: #4b5563;
}
</style>
