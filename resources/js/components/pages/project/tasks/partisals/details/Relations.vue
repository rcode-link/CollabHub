<script setup>
import {useRoute} from "vue-router";
import ListItem from "../ListItem.vue";
import {ref} from "vue";

const route = useRoute();

const relations = ref({
  data:[]
});
const load = () => {
  axios.get(`/api/v1/task/load/${route.query.task}/relations`, {
      params: {
          project_id: route.params.project
      }
  }).then(res => relations.value = res.data)
}
load();
</script>

<template>
  <div>
    <ListItem :tasks="relations.data"/>
  </div>
</template>

<style scoped>

</style>
