<script setup>

import InteractiveToast from "../../../shared/InteractiveToast.vue";
import {FwbButton} from "flowbite-vue";
import {useRoute, useRouter} from "vue-router";
const route = useRoute();
const router = useRouter()
const deleteProject = () => {
    axios.delete(`/api/v1/projects/${route.params.project}`)
        .then(() => {
            router.push({
                name: 'projects'
            })
        })
}

</script>

<template>

  <InteractiveToast>
    <template #trigger>
      <fwb-button color="red">Delete project</fwb-button>
    </template>
    <template #title>
      <h1>Are you sure?</h1>
    </template>
    <template #content>
      You are about to delete project!
    </template>
    <template #actions>
      <fwb-button @click="deleteProject" color="red" size="xs">Yes, delete it!</fwb-button>
    </template>
  </InteractiveToast>
</template>

<style scoped>

</style>
