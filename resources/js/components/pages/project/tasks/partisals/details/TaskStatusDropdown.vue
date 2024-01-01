<template>
    <fwb-dropdown>
        <template #trigger>
            <fwb-badge @click="loadStatuses" :type="obj.open ? 'default' : 'green'">
                {{ obj.title }}
            </fwb-badge>
        </template>
        <fwb-list-group>
            <fwb-list-group-item v-for="status in list" @click="() => updateTask(status.id)">
                {{ status.title }}
            </fwb-list-group-item>
        </fwb-list-group>
    </fwb-dropdown>
</template>
<script setup>
import {FwbDropdown, FwbListGroup, FwbListGroupItem, FwbBadge} from "flowbite-vue";
import {ref} from "vue";
import {useRoute} from "vue-router";
const route = useRoute();
const props = defineProps({
    obj: {},
    taskId: null
})

const list = ref([]);
const loadStatuses = () => {
    if(list.value.length){
        return;
    }
    axios.get(`/api/v1/tasks-statuses/`, {
        params: {
            project_id: route.params.project,
            board_id: props.obj.board.id
        }
    }).then((res) => {

        list.value = res.data.data;
    })
}

const updateTask = (id) => {
    let url = `/api/v1/tasks/change-status`;
    if(route.name !== 'project.board.view'){
        url += '?fullList=true'
    }
    axios.put(url, {
        status_id: id,
        sprint_id: props.obj.sprint.id,
        task_id: props.taskId
    })
}
</script>
