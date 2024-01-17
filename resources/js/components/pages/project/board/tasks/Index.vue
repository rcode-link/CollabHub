<script setup>

import Card from "../../../../shared/Card.vue";
import {useRoute, useRouter} from "vue-router";
import {FwbBadge, FwbButton, FwbCheckbox, FwbSelect} from "flowbite-vue";
import {onBeforeUnmount, onMounted, reactive, ref, watch} from "vue";
import {TailwindPagination} from "laravel-vue-pagination";
import Label from "../../../../shared/Label.vue";
import Text from "../../../../shared/Text.vue";
import UsersSelectInput from "../../../../shared/SelectUsersInProject.vue";
import {useBreadcrumbStore} from "../../../../../store/breadcrumb.js";
import {useBoardsState} from "../../../../../store/boards.js";
import InteractiveToast from "../../../../shared/InteractiveToast.vue";

const route = useRoute();
const router = useRouter();
const added = ref([]);
const timer = ref(null);
const tasks = ref({
    data: []
})
const taskTypesList = ref([]);
const statuses = ref([]);
const breadcrumbStore = useBreadcrumbStore();
const boardsState = useBoardsState();

const form = reactive({
    type_id: null,
    search: null,
    status_id: null,
    user_id: null,
    page: 1,
    in_sprint: 0,
});
const loadTasks = () => {
  axios.get('/api/v1/sprint/tasks', {
        params: {
            sprint_id: route.params.sprint,
            project_id: route.params.project,
            ...form,
        }
    }).then(res => tasks.value = res.data);

}
const load = () => {
    loadTasks();
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
}

const changePage = (page) => {
    form.page = page;
}

watch(() => form, (value, oldValue, onCleanup) => {
  added.value = [];
    router.push({
        query: form
    })

    clearTimeout(timer.value);
    timer.value = setTimeout(() => loadTasks(), 300);
}, {
    deep: true,
});

const addTaskToSprint = ({id}) => {
  axios.put('/api/v1/sprint/tasks', {
        sprint_id: route.params.sprint,
        task_id: id
    }).then(() => {
        added.value.push(id);
    });
}

const handleRemoveFromSprint = ({id}) => {
  axios.delete('/api/v1/sprint/tasks', {
        data: {
            sprint_id: route.params.sprint,
            task_id: id
        }
  }).then(() => {
    loadTasks();
    })
}



onMounted(() => {
    form.search = route.query.search;
    form.page = route.query.page ?? 1;
    form.user_id = route.query.user_id;
    form.type_id = route.query.type_id;
    form.status_id = route.query.status_id;
    form.in_sprint = route.query.in_sprint;
    load();

    const breadcrumItems = [
        {
            link: {
                name: 'project.board.view',
                params: {
                    board: boardsState.activeBoard.id,
                    sprint: boardsState.activeSprint.id
                },
            },
            title: boardsState.activeBoard.title
        }
    ];

    if (boardsState.activeSprint.title) {

        breadcrumItems.push({
            link: {
                name: 'project.board.view',
                params: {
                    board: boardsState.activeBoard.id,
                    sprint: boardsState.activeSprint.id
                },
            },
            title: boardsState.activeSprint.title
        });
    }

    breadcrumItems.push({
        title: 'Add tasks'
    });

    breadcrumbStore.addEntry(breadcrumItems)
})

onBeforeUnmount(() => {
    breadcrumbStore.addEntry([]);
})


</script>

<template>
    <Card class="gap-4 flex-col md:flex-row items-center">
        <div class="mb-4 w-full">
            <Label>Title or Description</Label>
            <Text v-model="form.search"/>
        </div>
        <div class="mb-4 w-full">
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
        <div class="mb-4 w-full">
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
        <div class="mb-4 w-full">
            <Label>By assigned user</Label>
            <UsersSelectInput :key="form.user_id" v-model="form.user_id" :show-clean-input="true"/>
        </div>
        <fwb-checkbox class="flex-1" v-model="form.in_sprint" label="Tasks in sprint"/>
    </Card>
    <Card class="flex-col overflow-auto">
        <div class="grid min-w-[600px] grid-cols-7 border-b font-bold p-1 gap-1">
            <div>Id</div>
            <div class="col-span-3">Task</div>
            <div>Status</div>
            <div>Type</div>
            <div></div>
        </div>
        <div v-for="obj in tasks.data" class="grid min-w-[600px] gap-1 grid-cols-7 items-center border-b p-1 hover:bg-gray-100 dark:hover:bg-gray-900">
            <div>

                {{ obj.task_id }}
            </div>
            <div class="col-span-3">{{ obj.name }}</div>
            <div>
                <fwb-badge :type="obj.status?.open ? 'default' : 'green'">{{ obj.status?.title }}</fwb-badge>
            </div>
            <div>{{ obj.type.title }}</div>
            <div class="flex justify-end">
                <fwb-button
                    v-if="!form.in_sprint"
                    :disabled="added.indexOf(obj.id) > -1"
                    size="xs" @click="() => addTaskToSprint(obj)" class="ml-auto">Add
                </fwb-button>
                <InteractiveToast
                    v-if="form.in_sprint"
                >
                    <template #trigger>
                        <fwb-button size="xs" color="red">
                            Remove from sprint
                        </fwb-button>
                    </template>
                    <template #title>
                        You are about to remove task from sprint.
                    </template>
                    <template #content>
                        Are you sure you want to remove <b>{{ obj.name }}</b> from sprint?
                    </template>
                    <template #actions>
                        <fwb-button
                            size="xs"
                            color="red"
                            @click="() => handleRemoveFromSprint(obj)"
                        >
                            Yes remove it!
                        </fwb-button>
                    </template>
                </InteractiveToast>
            </div>
        </div>
        <TailwindPagination
            class="mt-4"
            :data="tasks"
            :limit="3"
            @pagination-change-page="changePage"
        />
    </Card>
</template>

<style scoped>

</style>
