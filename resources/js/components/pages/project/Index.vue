<script setup>
import Auth from '@/components/layouts/Auth.vue'
import { useBreadcrumbStore } from '@/store/breadcrumb'
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { TailwindPagination } from 'laravel-vue-pagination'
import { FwbButton } from 'flowbite-vue'
import Card from '@/components/shared/Card.vue'
import Editor from '@/components/shared/Editor.vue'
import Modal from '@/components/shared/Modal.vue'
import Label from '@/components/shared/Label.vue'
import Text from '@/components/shared/Text.vue'

const breadcrumb = useBreadcrumbStore()
const router = useRouter()

const projects = ref({ data: [] })
const modalRef = ref()
const saving = ref(false)

const form = reactive({
  name: '',
  key: '',
})

breadcrumb.setLinks([
  { link: '/', title: 'Home' },
  { title: 'Projects' },
])

const load = (page = 1) => {
  axios.get('/api/v1/projects', { params: { page } }).then(res => {
    projects.value = res.data
  })
}

load()

// Auto-generate key from name (up to 5 uppercase letters from words)
watch(() => form.name, (name) => {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 1) {
    form.key = words[0].slice(0, 5).toUpperCase()
  } else {
    form.key = words.map(w => w[0]).join('').slice(0, 5).toUpperCase()
  }
})

const openModal = () => {
  form.name = ''
  form.key = ''
  modalRef.value.toggleModal()
}

const createProject = () => {
  if (!form.name.trim() || !form.key.trim()) return
  saving.value = true
  axios.post('/api/v1/projects', { ...form }).then(res => {
    modalRef.value.toggleModal()
    router.push({ name: 'project-details', params: { project: res.data.id } })
  }).finally(() => {
    saving.value = false
  })
}
</script>

<template>
  <Auth>
    <!-- Page header -->
    <div class="flex items-center justify-between mb-2">
      <h1 class="text-xl font-bold text-gray-900 dark:text-white">Projects</h1>
      <button
        @click="openModal"
        class="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-500"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New project
      </button>
    </div>

    <!-- Project grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4" v-if="projects.data.length">
      <router-link
        class="flex-1 h-full"
        v-for="obj in projects.data"
        :key="obj.id"
        :to="{ name: 'project-details', params: { project: obj.id } }"
      >
        <Card class="h-full">
          <div class="p-5">
            <div class="flex items-start justify-between gap-2 mb-2">
              <h5 class="text-xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                {{ obj.name }}
              </h5>
              <span class="flex-shrink-0 rounded bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 text-xs font-mono text-gray-500 dark:text-gray-400">
                {{ obj.key }}
              </span>
            </div>
            <div class="h-12 overflow-hidden">
              <Editor v-if="obj.description" :model="obj.description" />
            </div>
          </div>
        </Card>
      </router-link>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-24 text-center">
      <svg class="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
          d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
      </svg>
      <p class="text-sm font-medium text-gray-500 dark:text-gray-400">No projects yet</p>
      <p class="text-xs text-gray-400 dark:text-gray-500 mt-1 mb-4">Create your first project to get started</p>
      <button
        @click="openModal"
        class="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-500"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New project
      </button>
    </div>

    <TailwindPagination :limit="3" :data="projects" @pagination-change-page="load" />

    <!-- Create project modal -->
    <Modal ref="modalRef">
      <template #header>
        <h2 class="text-base font-semibold">New project</h2>
      </template>
      <template #body>
        <div class="space-y-4">
          <div>
            <Label>Project name</Label>
            <Text v-model="form.name" placeholder="e.g. Marketing Website" />
          </div>
          <div>
            <Label>
              Project key
              <span class="ml-1 text-xs font-normal text-gray-400">(used as document prefix)</span>
            </Label>
            <Text v-model="form.key" placeholder="e.g. MKT" />
            <p class="mt-1 text-xs text-gray-400">Short uppercase identifier, unique per project</p>
          </div>
        </div>
      </template>
      <template #footer>
        <FwbButton @click="createProject" :disabled="!form.name.trim() || !form.key.trim() || saving">
          {{ saving ? 'Creating…' : 'Create project' }}
        </FwbButton>
      </template>
    </Modal>
  </Auth>
</template>
