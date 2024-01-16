<script setup lang="ts">
import {ref} from "vue";
import AdvancedEditor from '../../../shared/advancedEditor/Index.vue';
import {useRoute, useRouter} from "vue-router";
import {useBreadcrumbStore} from "../../../../store/breadcrumb.js";
import InteractiveToast from "../../../shared/InteractiveToast.vue";

const document = ref({});
const route = useRoute();
const router = useRouter();
const breadcrumbStore = useBreadcrumbStore();
const toast = ref(null);

const load = () => {
  axios.get(`/api/v1/files/${route.params.id}`).then((response) => {
    document.value = response.data;
    breadcrumbStore.addEntry([
      {
        link: {
          name: 'project.documents',
          params: {
            project: route.params.project
          }
        },
        title: 'Documents'
      },
      {
        title: `${response.data.file_id} | ${response.data.title}`
      }
    ])
  })
}

const save = () => {
  axios.put(`/api/v1/files/${route.params.id}`, document.value).then(() => {
    toast.value.showToastFn()
  });
}

load();
</script>

<template>
  <div class="min-w-full max-w-full md:min-w-[950px] md:w-[950px] m-auto">
    <AdvancedEditor :key="document.id" v-model="document.content" @submitted="save"/>
  </div>
  <InteractiveToast ref="toast" type="green">
    <template #title>
      <h1>
        Congrats
      </h1>
    </template>
    <template #content>
      Document is saved
    </template>
  </InteractiveToast>
</template>

<style>

</style>
