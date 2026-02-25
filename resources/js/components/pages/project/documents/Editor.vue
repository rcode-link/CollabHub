<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import AdvancedEditor from '@/components/shared/advancedEditor/Index.vue'
import { useRoute } from 'vue-router'
import { useBreadcrumbStore } from '@/store/breadcrumb'
import { useAbility } from '@casl/vue'
import { useUserStore } from '@/store/user'
import { DateTime } from 'luxon'

const { can } = useAbility()
const userStore = useUserStore()
const document = ref({})
const saving = ref(false)
const saved = ref(false)
const loaded = ref(false)
const shareOpen = ref(false)
const shareLoading = ref(false)
const copied = ref(false)
const exporting = ref(false)
const route = useRoute()
const breadcrumbStore = useBreadcrumbStore()

const canUpdate = computed(() => can(`can-update-document.${document.value.id}`, ''))

const relativeTime = computed(() =>
  document.value.updated_at
    ? DateTime.fromISO(document.value.updated_at).toRelative()
    : null
)

const shareUrl = computed(() =>
  document.value.share_token
    ? `${window.location.origin}/d/${document.value.share_token}`
    : null
)

const load = () => {
  axios.get(`/api/v1/files/${route.params.id}`).then((response) => {
    document.value = response.data
    breadcrumbStore.addEntry([
      {
        link: { name: 'project.documents', params: { project: route.params.project } },
        title: 'Documents',
      },
      { title: response.data.title },
    ])
    nextTick(() => { loaded.value = true })
  })
}

const save = () => {
  saving.value = true
  saved.value = false
  axios.put(`/api/v1/files/${route.params.id}`, {
    title: document.value.title,
    content: document.value.content,
  }).then(() => {
    document.value.updated_at = new Date().toISOString()
    saved.value = true
  }).finally(() => {
    saving.value = false
  })
}

let saveTimer = null
const scheduleAutosave = () => {
  if (!loaded.value || !canUpdate.value) return
  saved.value = false
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => save(), 500)
}

watch(() => document.value.content, scheduleAutosave, { deep: true })
watch(() => document.value.title, scheduleAutosave)

const enableShare = () => {
  shareLoading.value = true
  axios.post(`/api/v1/files/${document.value.id}/share`)
    .then(({ data }) => { document.value.share_token = data.share_token })
    .finally(() => { shareLoading.value = false })
}

const revokeShare = () => {
  shareLoading.value = true
  axios.delete(`/api/v1/files/${document.value.id}/share`)
    .then(() => { document.value.share_token = null })
    .finally(() => { shareLoading.value = false })
}

const copyLink = () => {
  if (!shareUrl.value) return
  navigator.clipboard.writeText(shareUrl.value).then(() => {
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  })
}

const exportPdf = () => {
  exporting.value = true
  axios.post(`/api/v1/files/${document.value.id}/export-pdf`, null, { responseType: 'blob' })
    .then(({ data }) => {
      const url = URL.createObjectURL(data)
      const a = window.document.createElement('a')
      a.href = url
      a.download = (document.value.title || 'document') + '.pdf'
      a.click()
      URL.revokeObjectURL(url)
    })
    .finally(() => { exporting.value = false })
}

load()
</script>

<template>
  <div class="min-h-full flex flex-col">

    <!-- Sticky document header -->
    <div class="sticky top-0 z-30 flex items-center gap-3 px-5 h-11 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 shrink-0">

      <!-- Title -->
      <span class="font-semibold text-sm text-gray-800 dark:text-white truncate min-w-0 flex-1">
        {{ document.title || 'Untitled' }}
      </span>

      <!-- File ID badge -->
      <span
        v-if="document.file_id"
        class="font-mono text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-400 rounded px-1.5 py-0.5 shrink-0"
      >{{ document.file_id }}</span>

      <!-- Save status -->
      <div class="flex items-center gap-1.5 shrink-0 text-xs">
        <template v-if="saving">
          <svg class="w-3 h-3 animate-spin text-blue-400" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="15 45" stroke-linecap="round"/>
          </svg>
          <span class="text-blue-500">Saving…</span>
        </template>
        <template v-else-if="saved && relativeTime">
          <svg class="w-3 h-3 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 13l4 4L19 7"/>
          </svg>
          <span class="text-gray-400">Saved {{ relativeTime }}</span>
        </template>
        <template v-else-if="relativeTime">
          <span class="text-gray-400">Edited {{ relativeTime }}</span>
        </template>
      </div>

      <!-- Export PDF button -->
      <button
        class="inline-flex items-center justify-center gap-1.5 text-xs px-2.5 py-1 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shrink-0 disabled:opacity-50"
        :disabled="exporting"
        @click="exportPdf"
      >
        <svg v-if="exporting" class="w-3.5 h-3.5 shrink-0 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="15 45" stroke-linecap="round"/>
        </svg>
        <svg v-else class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        {{ exporting ? 'Exporting…' : 'PDF' }}
      </button>

      <!-- Share button -->
      <div v-if="canUpdate" class="relative shrink-0">
        <button
          class="inline-flex items-center justify-center gap-1.5 text-xs px-2.5 py-1 rounded-md border transition-colors"
          :class="document.share_token
            ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'"
          @click="shareOpen = !shareOpen"
        >
          <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          Share
        </button>

        <!-- Backdrop to close panel on outside click -->
        <div v-if="shareOpen" class="fixed inset-0 z-40" @click="shareOpen = false" />

        <!-- Share panel -->
        <Transition
          enter-active-class="transition ease-out duration-100"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition ease-in duration-75"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="shareOpen"
            class="absolute right-0 top-full mt-1.5 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4 z-50"
          >
            <!-- Not shared -->
            <template v-if="!document.share_token">
              <p class="text-sm font-medium text-gray-800 dark:text-white mb-1">Share document</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Generate a public link so anyone can view this document without signing in.
              </p>
              <button
                class="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                :disabled="shareLoading"
                @click="enableShare"
              >
                <svg v-if="shareLoading" class="w-3.5 h-3.5 shrink-0 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="15 45" stroke-linecap="round"/>
                </svg>
                Create share link
              </button>
            </template>

            <!-- Shared -->
            <template v-else>
              <div class="flex items-center justify-between mb-3">
                <p class="text-sm font-medium text-gray-800 dark:text-white">Shared</p>
                <span class="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                  <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Public
                </span>
              </div>

              <!-- Link row -->
              <div class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg mb-3">
                <span class="flex-1 text-xs text-gray-600 dark:text-gray-300 truncate font-mono">{{ shareUrl }}</span>
                <button
                  class="shrink-0 text-xs px-2 py-1 rounded-md font-medium transition-colors"
                  :class="copied
                    ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'"
                  @click="copyLink"
                >
                  {{ copied ? 'Copied!' : 'Copy' }}
                </button>
              </div>

              <!-- Revoke -->
              <button
                class="w-full inline-flex items-center justify-center gap-2 px-3 py-1.5 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                :disabled="shareLoading"
                @click="revokeShare"
              >
                <svg v-if="shareLoading" class="w-3 h-3 shrink-0 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="15 45" stroke-linecap="round"/>
                </svg>
                Revoke link
              </button>
            </template>
          </div>
        </Transition>
      </div>

    </div>

    <!-- Loading skeleton -->
    <div v-if="!loaded" class="max-w-3xl mx-auto w-full py-12 px-10 flex flex-col gap-4 animate-pulse">
      <div class="h-9 bg-gray-100 dark:bg-gray-800 rounded-lg w-2/3"></div>
      <div class="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full"></div>
      <div class="h-4 bg-gray-100 dark:bg-gray-800 rounded w-5/6"></div>
      <div class="h-4 bg-gray-100 dark:bg-gray-800 rounded w-4/6"></div>
    </div>

    <!-- Editor -->
    <div v-else class="max-w-3xl mx-auto w-full flex flex-col gap-3 py-4">
      <AdvancedEditor
        :key="document.id"
        v-model="document.content"
        :editable="canUpdate"
        :notion="true"
        @submitted="save"
      >
        <template #before-content>
          <div class="px-10 pt-8 pb-2 border-b border-gray-100 dark:border-gray-800">
            <input
              v-model="document.title"
              :readonly="!canUpdate"
              class="block w-full text-3xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 caret-gray-900 dark:caret-white"
              placeholder="Untitled"
            />
          </div>
        </template>
      </AdvancedEditor>
    </div>

  </div>
</template>
