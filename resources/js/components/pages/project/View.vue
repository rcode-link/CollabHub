<script setup>
import Auth from '@/components/layouts/Auth.vue'
import { useBreadcrumbStore } from '@/store/breadcrumb'
import { useRoute, useRouter } from 'vue-router'
import { onBeforeUnmount, watch } from 'vue'
import TaskDetails from '@/components/pages/project/tasks/Details.vue'
import { useTasksStore } from '@/store/tasksStore.js'

const route = useRoute()
const router = useRouter()
const createTasks = useTasksStore()
const breadcrumb = useBreadcrumbStore()

breadcrumb.setLinks([{ link: '/', title: 'Home' }])

const loadData = () => {
  axios
    .get(`/api/v1/projects/${route.params.project}`)
    .then(res => {
      breadcrumb.setLinks([
        { link: '/', title: 'Home' },
        { title: 'Projects', link: { name: 'projects' } },
        { link: { name: 'project-details', params: { project: res.data.id } }, title: res.data.name },
      ])
    })
    .catch(error => {
      if (error.response.status === 403) {
        router.push('/404')
      }
    })
}

watch(() => route.params.project, () => { loadData() }, { immediate: true })

onBeforeUnmount(() => {
  breadcrumb.addEntry([])
})
</script>

<template>
  <Auth>
    <router-view :key="route.params.project"></router-view>
    <TaskDetails v-if="route.query.task && !createTasks.showCreateTasksModal" />
  </Auth>
</template>

