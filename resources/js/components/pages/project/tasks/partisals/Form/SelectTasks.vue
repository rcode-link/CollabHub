<script setup lang="ts">

import AutoComplete from "../../../../../shared/AutoComplete.vue";
import {ref, watch} from "vue";
import {useRoute} from "vue-router";
import _ from "lodash";
import {FwbSelect} from "flowbite-vue";

const emit = defineEmits(['update'])
const route = useRoute();
const taskRelations = ref({
  data: []
})
const relatedTasks = ref({
  data: []
});

const selectedItems = ref([]);

const searchTasks = (value) => {
  axios.get('/api/v1/tasks/search', {
    params: {
      project_id: route.params.project,
      search: value
    }
  }).then((res) => {
    relatedTasks.value = res.data;
  })
}

const getTaskRelations = () => {
  axios.get('/api/v1/task/relations').then(res => taskRelations.value = res.data);
}

const itemSelected = (id) => {
  selectedItems.value.push({
    task_relation_id: null,
    task: _.find(relatedTasks.value.data, {id: _.toNumber(id)})
  })
}

getTaskRelations();


watch(selectedItems, () => {
  emit('update', selectedItems);
}, {
  deep: true
})

</script>

<template>
  <div>
    <AutoComplete :items="relatedTasks?.data?.map(obj => {
                      return {
                        value: obj.id,
                        label: obj.task_id + ' - ' + obj.name
                      }
                    })" @search="searchTasks" @selected="itemSelected"/>
    <div>
      <div class="flex my-2 border-b pb-1 items-center gap-4" v-for="(obj, index) in selectedItems">
        <fwb-select
            :key="obj.task_relation_id"
            v-model="obj.task_relation_id"
            :options="taskRelations.data.map(item => {
                                   return {
                                       value: item.id, name: item.name
                                   }
                                })"
        />
        <b>{{ obj.task.task_id }} </b> {{ obj.task.name }}
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
