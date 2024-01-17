<script setup>

import Auth from "../../layouts/Auth.vue";
import {useBreadcrumbStore} from "../../../store/breadcrumb.js";
import {useRoute, useRouter} from "vue-router";
import {computed, onBeforeUnmount, onMounted, ref, watch} from "vue";
import TaskDetails from './tasks/Details.vue'
import {useTasksStore} from "../../../store/tasksStore.js";
import {FwbButton, FwbDropdown, FwbListGroup, FwbListGroupItem} from "flowbite-vue";
import ArrowDownIcon from "../../shared/icons/ArrowDownIcon.vue";


const route = useRoute();
const router = useRouter();
const createTasks = useTasksStore();
const breadcrumb = useBreadcrumbStore();

const mobileView = ref(null);

breadcrumb.setLinks([
  {
    link: '/',
    title: 'Home'
  }
])

axios.get(`/api/v1/projects/${route.params.project}`).then(res => {
  const list = [
    {
      link: '/',
      title: 'Home'
    },
    {
      title: 'Projects',
      link: {
        name: 'projects'
      }
    },
    {
      link: {
        name: 'project-details',
        params: {
          project: res.data.id
        }
      },
      title: res.data.name
    }

  ];
  breadcrumb.setLinks(list)
}).catch(error => {
  if (error.response.status === 403) {
    router.push('/404');
  }
});

watch(mobileView, () => {
    router.push({
        ...route,
        name: mobileView.value,
    })
})

onMounted(() => {
    if (mobileView.value === null && route.name === 'project-details') {
        mobileView.value = 'project.dashboard';
        return;
    }
    mobileView.value = route.name;
})

onBeforeUnmount(() => {
    breadcrumb.addEntry([]);
})

const listForDropDown = {
    'project.dashboard': 'Dashboard',
    'project.tasks': 'Backlog',
    'project.board.view': 'Boards',
    'project.documents': 'Documents',
    'project.documents.settings': 'Settings',
};


const activeBoard = computed(() => {
        return listForDropDown[mobileView.value]
})

</script>

<template>
  <Auth>
      <ul class="hidden lg:flex  flex-wrap font-medium text-center text-gray-500 dark:text-gray-400 text-sm">
      <li>
        <router-link :to="{
          name: 'project.dashboard'
        }"
                     class="router-link">
          Dashboard
        </router-link>
      </li>
      <li>

        <router-link :to="{
          name: 'project.tasks'
        }" class="router-link">
          Backlog
        </router-link>
      </li>
      <li>
        <router-link :to="{
          name: 'project.board.view'
        }"
                     class="router-link">
          Boards
        </router-link>

      </li>
      <li>
        <router-link :to="{
          name: 'project.documents'
        }"
                     class="router-link">
          Documents
        </router-link>
      </li>
      <li>
        <router-link :to="{
          name: 'project.documents.settings'
        }"
                     class="router-link">
          Settings
        </router-link>
      </li>
    </ul>
<div class="lg:hidden z-[40]">
    <fwb-dropdown text="Bottom" class="w-full">
        <template #trigger>
            <fwb-button class="cursor-pointer">
                <div  class="w-full flex justify-between items-center gap-4  ">
                    {{ activeBoard}} <ArrowDownIcon class="w-2 h-2" />
                </div>
            </fwb-button>
        </template>
        <fwb-list-group class="z-50">
            <fwb-list-group-item class="z-50 cursor-pointer" v-for="(str, key) in listForDropDown" @click="() => mobileView = key">
                {{ str }}
            </fwb-list-group-item>
        </fwb-list-group>
    </fwb-dropdown>

</div>
    <router-view></router-view>
    <TaskDetails v-if="route.query.task && !createTasks.showCreateTasksModal"/>
  </Auth>
</template>

<style scoped>
.router-link {
  @apply mb-4 cursor-pointer no-underline inline-block p-4 rounded-t-lg border-b-2 border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300
}
.router-link-active {
  @apply font-bold text-blue-800 dark:text-blue-400 border-blue-800 dark:border-blue-400
}
</style>
