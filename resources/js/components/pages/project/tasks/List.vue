<script setup lang="ts">

import {
    FwbBadge,
    FwbSelect,
    FwbTable,
    FwbTableBody,
    FwbTableCell,
    FwbTableHead,
    FwbTableHeadCell,
    FwbTableRow
} from "flowbite-vue";
import {useAbility} from "@casl/vue";
import {useRoute, useRouter} from "vue-router";
import {onBeforeUnmount, onMounted, reactive, ref, watch} from "vue";
import Editor from "../../../shared/Editor.vue";
import User from "./User.vue";
import {TailwindPagination} from 'laravel-vue-pagination';
import Text from "../../../shared/Text.vue";
import Label from "../../../shared/Label.vue";
import UsersSelectInput from "../../../shared/SelectUsersInProject.vue";
import _ from "lodash";
import {DateTime} from "luxon";
import {useBreadcrumbStore} from "../../../../store/breadcrumb.js";
import {useTasksStore} from "../../../../store/tasksStore.js";

const route = useRoute();
const router = useRouter();
const {can, rules} = useAbility()

const taskTypesList = ref([]);
const statuses = ref([]);
const tasksStore = useTasksStore();
const breadcrumbStore = useBreadcrumbStore();

const form = reactive({
  type_id: null,
  search: null,
  status_id: null,
  user_id: null,
  page: 1
});
const load = () => {
  const withoutNulls = _.omitBy(route.query, _.isNull);
  withoutNulls.project_id = route.params.project;
  tasksStore.loadTasks(withoutNulls);
}


const initData = () => {
  axios.get(`/api/v1/tasks-statuses/`, {
    params: {
      project_id: route.params.project
    }
  }).then((res) => {
    statuses.value = res.data.data;
  })

  axios.get('/api/v1/task-types').then(res => {
    taskTypesList.value = res.data;
  })


  Echo
      .private(`task-updated.${route.params.project}`)
      .listen('TaskUpdatedEvent', ({task}) => {
        const index = _.findIndex(tasksStore.tasks.data, {'id': _.toNumber(task.id)});
        if (index > -1) {
          tasksStore.tasks.data.splice(index, 1, task);
        }
      })
}

watch(() => form, (value, oldValue, onCleanup) => {
  router.push({
    query: {
      ...route.query,
      ...form,
    }
  })
}, {
  deep: true,
});
const timeOut = ref(null);
watch(() => route.query, () => {
  clearTimeout(timeOut.value);
  timeOut.value = setTimeout(() => load(), 300);
}, {
  immediate: true
})

onMounted(() => {
  form.search = route.query.search;
  form.page = route.query.page;
  form.user_id = route.query.user_id;
  form.type_id = route.query.type_id;
  form.status_id = route.query.status_id;

  initData();
    breadcrumbStore.addEntry([{
      link: '',
      title: 'Tasks'
  }])
})

onBeforeUnmount(() => {
    breadcrumbStore.addEntry([]);
})

const openTask = (obj) => {
  router.push({
    ...route,
    query: {
      ...route.query,
      task: obj.task_id
    }
  })
}
</script>

<template>
  <div class="flex flex-col gap-4 pb-2">
    <div class="grid grid-cols-1 md:grid-cols-4 md:gap-4">
      <div class="mb-4">
        <Label>Title or Description</Label>
        <Text v-model="form.search"/>
      </div>
      <div class="mb-4">
        <fwb-select
            v-model="form.type_id"
            :options="[
                        {value: null, name: 'Select task type'},
                        ...taskTypesList.map(obj => {
                                   return {
                                       value: obj.id, name: obj.title
                                   }
                                })]"
            label="Type"
        />
      </div>
      <div class="mb-4">
        <fwb-select
            v-model="form.status_id"
            :options="[
                        {value: null, name: 'Select status'},
                        ...statuses.map(obj => {
                                   return {
                                       value: obj.id, name: obj.title
                                   }
                                })]"
            label="Status"
        />
      </div>
      <div class="mb-4">
        <Label>By assigned user</Label>
        <UsersSelectInput :key="form.user_id" v-model="form.user_id" :show-clean-input="true"/>
      </div>
    </div>

    <fwb-table class="" hoverable>
      <fwb-table-head>
        <fwb-table-head-cell>Id</fwb-table-head-cell>
        <fwb-table-head-cell>Task</fwb-table-head-cell>
        <fwb-table-head-cell class="hidden lg:block">Description</fwb-table-head-cell>
        <fwb-table-head-cell>Relations</fwb-table-head-cell>
        <fwb-table-head-cell>Tags</fwb-table-head-cell>
        <fwb-table-head-cell>Type</fwb-table-head-cell>
        <fwb-table-head-cell>User</fwb-table-head-cell>
      </fwb-table-head>
      <fwb-table-body>
        <fwb-table-row v-for="obj in tasksStore.tasks.data" class="cursor-pointer" :key="JSON.stringify(obj)"
                       @click="() => openTask(obj)">
          <fwb-table-cell>
            <router-link :to="{
    ...route,
    query: {
      ...route.query,
      task: obj.task_id
    }
  }">
              {{ obj.task_id }}
            </router-link>
          </fwb-table-cell>
          <fwb-table-cell>
            {{ obj.name }}
            <div v-if="obj.due_date">
              {{ DateTime.fromISO(obj.due_date).toLocaleString(DateTime.DATE_SHORT) }}
            </div>
          </fwb-table-cell>
          <fwb-table-cell class="hidden lg:block">
            <Editor :model="obj.description" class="h-4 overflow-hidden" :editable="false"/>
          </fwb-table-cell>

          <fwb-table-cell>{{ obj.children_count }}</fwb-table-cell>
          <fwb-table-cell>
            <div class="flex gap-1 mt-2 flex-wrap">
              <fwb-badge v-for="(str, index) in obj.tags">{{ str }}</fwb-badge>
            </div>
          </fwb-table-cell>
          <fwb-table-cell>
            <fwb-badge>{{ obj.type.title }}</fwb-badge>
          </fwb-table-cell>
          <fwb-table-cell class=""
                          @click="(e) => e.preventDefault()">
            <User :show-name="false" :user="obj.user"/>
          </fwb-table-cell>
        </fwb-table-row>
      </fwb-table-body>
    </fwb-table>
    <TailwindPagination
        class=""
        :limit="3"
        :data="tasksStore.tasks"
        @pagination-change-page="(page) => form.page = page"
    />
  </div>
</template>

<style scoped>
</style>
