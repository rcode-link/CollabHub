<script setup lang="ts">
import Auth from "../../layouts/Auth.vue";
import {useBreadcrumbStore} from "../../../store/breadcrumb.js";
import {ref} from "vue";
import {TailwindPagination} from "laravel-vue-pagination";
import Card from "../../shared/Card.vue";
import Editor from "../../shared/Editor.vue";
import {FwbAlert} from "flowbite-vue";

const breadcrumb = useBreadcrumbStore();

const projects = ref({
  data: []
});

breadcrumb.setLinks([
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
        title: 'Index'
    }
])
const load = (page = 1) => {
    axios.get('/api/v1/projects', {
        params: {
            page
        }
    }).then((res) => {
        projects.value = res.data;
    })
}
load();
</script>

<template>
    <Auth>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4" v-if="projects.data.length">
            <router-link class="flex-1 h-full" v-for="obj in projects.data" :to="{
                         name: 'project-details',
                         params: {
                             project: obj.id
                         }

                         }">

                <Card class=" h-full">
                    <div class="p-5">
                        <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            {{ obj.name }}
                        </h5>
                        <div class="h-12 overflow-hidden">
                            <Editor v-if="obj.description" :model="obj.description" />
                        </div>
                    </div>
                </Card>
            </router-link>
        </div>
      <fwb-alert type="warning" v-else>
        You don't have any projects
      </fwb-alert>
      <TailwindPagination
            class=""
            :limit="3"
            :data="projects"
            @pagination-change-page="load"
        />
    </Auth>
</template>

<style scoped>

</style>
