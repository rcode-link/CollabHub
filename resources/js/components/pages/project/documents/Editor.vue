<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import AdvancedEditor from '../../../shared/advancedEditor/Index.vue'
import { useRoute } from 'vue-router'
import { useBreadcrumbStore } from '../../../../store/breadcrumb'
import { DateTime } from 'luxon'

const document = ref({})
const saving = ref(false)
const loaded = ref(false)
const route = useRoute()
const breadcrumbStore = useBreadcrumbStore()

const relativeTime = computed(() =>
  document.value.updated_at
    ? DateTime.fromISO(document.value.updated_at).toRelative()
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
  axios.put(`/api/v1/files/${route.params.id}`, {
    title: document.value.title,
    content: document.value.content,
  }).then(() => {
    document.value.updated_at = new Date().toISOString()
  }).finally(() => {
    saving.value = false
  })
}

let saveTimer = null
const scheduleAutosave = () => {
  if (!loaded.value) return
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => save(), 500)
}

watch(() => document.value.content, scheduleAutosave, { deep: true })
watch(() => document.value.title, scheduleAutosave)

load()
</script>

<template>
  <div class="max-w-3xl mx-auto flex flex-col gap-3">

    <!-- Meta bar -->
    <div class="flex items-center gap-2 px-1">
      <span
        v-if="document.file_id"
        class="font-mono text-[11px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded px-1.5 py-0.5"
      >{{ document.file_id }}</span>
      <span v-if="relativeTime" class="text-xs text-gray-400">Edited {{ relativeTime }}</span>
      <span v-if="saving" class="ml-auto text-xs text-blue-500 animate-pulse">Saving…</span>
    </div>

    <!-- Editor card: bubble toolbar on selection, title, content -->
    <AdvancedEditor
      :key="document.id"
      v-model="document.content"
      :editable="true"
      :notion="true"
      @submitted="save"
    >
      <template #before-content>
        <div class="px-10 pt-8 pb-2 border-b border-gray-100 dark:border-gray-800">
          <input
            v-model="document.title"
            class="block w-full text-3xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 caret-gray-900 dark:caret-white"
            placeholder="Untitled"
          />
        </div>
      </template>
    </AdvancedEditor>

  </div>
</template>
