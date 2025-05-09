<template>
  <fwb-dropdown
    text="Bottom"
    :placement="isMobile ? '' : 'left'"
    class="w-auto"
  >
    <template #trigger>
      <div class="h-full flex space-x-2 items-center">
        <ArchiveBoxIcon class="w-6 h-6" />
        <span v-if="isMobile">Projects</span>
      </div>
    </template>
    <div>
      <fwb-list-group class="w-72" v-if="lastProject">
        <fwb-list-group-item>
          <router-link
            class="w-full h-full"
            :to="{
              name: 'project.dashboard',
              params: {
                project: lastProject.id,
              },
            }"
          >
            {{ lastProject.name }}
          </router-link>
        </fwb-list-group-item>
      </fwb-list-group>

      <fwb-list-group class="w-72">
        <fwb-list-group-item>
          <fwb-input
            class="w-full"
            placeholder="Enter project name..."
            label="Search"
            v-model="search"
          />
        </fwb-list-group-item>

        <div class="flex flex-col p-2">
          <fwb-list-group-item v-for="obj in forPrint" :key="obj">
            <div
              class="w-full hover:underline cursor-pointer h-full"
              @click="() => handleOpenProject(obj)"
            >
              {{ obj.name }}
            </div>
          </fwb-list-group-item>
        </div>
      </fwb-list-group>
    </div>
  </fwb-dropdown>
</template>
<script setup>
import {
  FwbInput,
  FwbDropdown,
  FwbListGroup,
  FwbListGroupItem,
} from 'flowbite-vue'

import ArchiveBoxIcon from '../shared/icons/ArchiveBoxIcon.vue'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
function detectMob() {
  const toMatch = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
  ]

  return toMatch.some(toMatchItem => {
    return navigator.userAgent.match(toMatchItem)
  })
}

const isMobile = detectMob()
const lastProjectId = ref(null)
const projects = ref({
  data: [],
})
const search = ref('')

const handleOpenProject = obj => {
  localStorage.setItem('lastProject', obj.id)
  lastProjectId.value = obj.id
  router.push({
    name: 'project.dashboard',
    params: {
      project: obj.id,
    },
  })
}
const forPrint = computed(() =>
  projects.value.data.filter(obj =>
    obj.name.toLowerCase().includes(search.value.toLowerCase()),
  ),
)
const lastProject = computed(() => {
  return projects.value.data.find(obj => obj.id == lastProjectId.value)
})
const load = (page = 1) => {
  axios
    .get('/api/v1/projects', {
      params: {
        page,
      },
    })
    .then(res => {
      projects.value = res.data
    })
}
onMounted(() => {
  load()
  lastProjectId.value = localStorage.getItem('lastProject', null)
})
</script>
