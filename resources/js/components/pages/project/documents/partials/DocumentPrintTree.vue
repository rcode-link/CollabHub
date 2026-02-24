<script setup>
import DocumentItem from '@/components/pages/project/documents/partials/DocumentItem.vue'
import { computed, inject, nextTick, ref } from 'vue'

const fileStore = inject('fileStore')
const createItem = inject('createItem')
const canCreateDocument = inject('canCreateDocument', true)

const props = defineProps({
  parent_id: { default: null },
  depth: { type: Number, default: 0 },
  root: { type: Boolean, default: false },
  entityId: { default: null },
  entityType: { default: null },
})

const items = computed(() =>
  fileStore.getDocuments.filter(item => item.parent_id === props.parent_id),
)

// --- Inline add ---
const adding = ref(null) // null | 'file' | 'folder'
const newTitle = ref('')
const inputRef = ref()

const startAdding = async type => {
  adding.value = type
  newTitle.value = ''
  await nextTick()
  inputRef.value?.focus()
}

const cancelAdding = () => {
  adding.value = null
  newTitle.value = ''
}

const confirmAdd = () => {
  if (!newTitle.value.trim()) return cancelAdding()
  // Synthetic project-folder IDs (e.g. "proj_1") don't exist in the DB —
  // items placed directly under a project folder have parent_id = null.
  const dbParentId = typeof props.parent_id === 'string' && props.parent_id.startsWith('proj_')
    ? null
    : props.parent_id
  createItem({
    type: adding.value,
    title: newTitle.value.trim(),
    parent_id: dbParentId,
    entityId: props.entityId,
    entityType: props.entityType,
  }).then(() => cancelAdding())
}

const onKeydown = e => {
  if (e.key === 'Enter') confirmAdd()
  if (e.key === 'Escape') cancelAdding()
}
</script>

<template>
  <!-- Root row (root level only) -->
  <div
    v-if="root"
    class="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 px-4 py-3 bg-white dark:bg-gray-800"
  >
    <div class="w-3.5 flex-shrink-0" />
    <svg
      class="h-5 w-5 flex-shrink-0 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
        d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m0 0h4m-4 0H7m10 0v-8m0 0l2 2"
      />
    </svg>
    <span class="flex-1 text-sm font-semibold text-gray-700 dark:text-gray-200">
      Documents
      <span class="ml-1.5 text-xs font-normal text-gray-400">
        {{
          fileStore.getDocuments.filter(d => d.type !== 'project-folder').length
        }}
        item{{
          fileStore.getDocuments.filter(d => d.type !== 'project-folder')
            .length !== 1
            ? 's'
            : ''
        }}
      </span>
    </span>
    <template v-if="canCreateDocument">
      <button
        @click.stop="startAdding('folder')"
        class="flex items-center gap-1 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 transition hover:bg-gray-50 dark:hover:bg-gray-600"
      >
        <svg
          class="h-3.5 w-3.5 text-yellow-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
          />
        </svg>
        New folder
      </button>
      <button
        @click.stop="startAdding('file')"
        class="flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white transition hover:bg-blue-500"
      >
        <svg
          class="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        New document
      </button>
    </template>
  </div>

  <!-- Empty state (root level only, no items and not adding) -->
  <div
    v-if="root && items.length === 0 && !adding"
    class="flex flex-col items-center justify-center py-16 text-center"
  >
    <svg
      class="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
        d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
      />
    </svg>
    <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
      No documents yet
    </p>
    <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
      Create a document or folder to get started
    </p>
  </div>

  <!-- Items -->
  <DocumentItem v-for="obj in items" :key="obj.id" :obj="obj" :depth="depth" />

  <!-- Inline add row -->
  <div
    v-if="adding"
    :style="{ paddingLeft: `${depth * 1.25 + 1}rem` }"
    class="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 last:border-0 pr-4 py-2 bg-blue-50/60 dark:bg-blue-900/10"
  >
    <div class="w-3.5 flex-shrink-0" />
    <div class="flex-shrink-0">
      <svg
        v-if="adding === 'folder'"
        class="h-5 w-5 text-yellow-400"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
        />
      </svg>
      <svg
        v-else
        class="h-5 w-5 text-blue-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    </div>
    <input
      ref="inputRef"
      v-model="newTitle"
      @keydown="onKeydown"
      @blur="cancelAdding"
      :placeholder="adding === 'folder' ? 'Folder name…' : 'Document name…'"
      class="flex-1 bg-transparent text-sm font-medium text-gray-800 dark:text-gray-100 outline-none placeholder-gray-400"
    />
    <button
      @mousedown.prevent="confirmAdd"
      class="flex-shrink-0 rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white transition hover:bg-blue-500"
    >
      Create
    </button>
    <button
      @mousedown.prevent="cancelAdding"
      class="flex-shrink-0 rounded-md border border-gray-200 dark:border-gray-600 px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 transition hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      Cancel
    </button>
  </div>

  <!-- Subfolder add row (non-root only) -->
  <div
    v-if="!root && !adding && canCreateDocument"
    :style="{ paddingLeft: `${depth * 1.25 + 1}rem` }"
    class="flex items-center gap-2 pr-4 py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0"
  >
    <div class="w-3.5 flex-shrink-0" />
    <div class="w-5 flex-shrink-0" />
    <button
      @click.stop="startAdding('folder')"
      class="flex items-center gap-1 text-xs text-gray-400 hover:text-yellow-500 transition"
    >
      <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
        <path
          d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
        />
      </svg>
      + folder
    </button>
    <span class="text-gray-200 dark:text-gray-700">·</span>
    <button
      @click.stop="startAdding('file')"
      class="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 transition"
    >
      <svg
        class="h-3.5 w-3.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 4v16m8-8H4"
        />
      </svg>
      + document
    </button>
  </div>
</template>
