<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AdvancedEditor from '@/components/shared/advancedEditor/Index.vue'

const route = useRoute()
const document = ref(null)
const error = ref(null)

onMounted(() => {
  axios.get(`/api/v1/shared/d/${route.params.token}`)
    .then(({ data }) => { document.value = data })
    .catch(() => { error.value = true })
})
</script>

<template>
  <!-- Full-page shared document: no sidebar, no toolbar, read-only -->
  <div class="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">

    <!-- Loading -->
    <div v-if="!document && !error" class="flex items-center justify-center min-h-screen">
      <div class="flex flex-col items-center gap-3 text-gray-400">
        <svg class="w-6 h-6 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="15 45" stroke-linecap="round"/>
        </svg>
        <span class="text-sm">Loading document…</span>
      </div>
    </div>

    <!-- Not found -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <p class="text-4xl font-bold text-gray-200 dark:text-gray-700 mb-2">404</p>
        <p class="text-sm text-gray-400">This document is not available or the link has expired.</p>
      </div>
    </div>

    <!-- Document content -->
    <div v-else class="max-w-3xl mx-auto px-4 py-12">
      <h1 class="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        {{ document.title || 'Untitled' }}
      </h1>
      <AdvancedEditor
        :model-value="document.content"
        :editable="false"
        :notion="true"
      />
    </div>

  </div>
</template>
