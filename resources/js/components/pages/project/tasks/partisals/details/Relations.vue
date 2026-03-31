<script setup>
import {useRoute} from "vue-router";
import ListItem from "@/components/pages/project/tasks/partisals/ListItem.vue";
import {ref, watch} from "vue";

const route = useRoute();

const relations = ref({
  data:[]
});
const load = () => {
  if (!route.query.task) return;
  axios.get(`/api/v1/task/load/${route.query.task}/relations`, {
      params: {
          project_id: route.params.project
      }
  }).then(res => relations.value = res.data)
}
load();
watch(() => route.query.task, () => load());
</script>

<template>
  <div>
    <ListItem :tasks="relations.data"/>
  </div>
</template>

<style scoped>

</style>
