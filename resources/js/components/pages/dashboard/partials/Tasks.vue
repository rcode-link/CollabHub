<script setup lang="js">
import { FwbCard, FwbAlert, FwbBadge, FwbTable, FwbTableBody, FwbTableCell, FwbTableHead, FwbTableHeadCell, FwbTableRow } from "flowbite-vue";
import { ref } from "vue";
//@ts-ignore
import User from "../../project/tasks/User.vue";
//@ts-ignore
import Editor from "../../../shared/Editor.vue";
import { DateTime } from "luxon";

const tasks = ref([]);
const loadMyTasks = () => {
    window.axios.get("/api/v1/dashboard/tasks").then((res) => {
        tasks.value = res.data.data;
    });
};

loadMyTasks();
</script>

<template>
    <FwbCard class="flex flex-col h-full !max-w-none w-full p-5">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-4">My Tasks</h3>
        <fwb-table v-if="tasks.length" hoverable>
            <fwb-table-head>
                <fwb-table-head-cell>Id</fwb-table-head-cell>
                <fwb-table-head-cell>Task</fwb-table-head-cell>
                <fwb-table-head-cell class="hidden lg:block">Description</fwb-table-head-cell>
                <fwb-table-head-cell>Type</fwb-table-head-cell>
                <fwb-table-head-cell>User</fwb-table-head-cell>
                <fwb-table-head-cell></fwb-table-head-cell>
            </fwb-table-head>
            <fwb-table-body>
                <fwb-table-row
                    v-for="obj in tasks"
                    class="cursor-pointer"
                    :key="JSON.stringify(obj)"
                >
                    <fwb-table-cell>{{ obj.task_id }}</fwb-table-cell>
                    <fwb-table-cell>
                        {{ obj.name }}
                        <div v-if="obj.due_date">
                            {{ DateTime.fromISO(obj.due_date).toLocaleString(DateTime.DATE_SHORT) }}
                        </div>
                    </fwb-table-cell>
                    <fwb-table-cell class="hidden lg:block">
                        <Editor :model="obj.description" class="h-4 overflow-hidden" :editable="false" />
                    </fwb-table-cell>
                    <fwb-table-cell>
                        <fwb-badge>{{ obj.type.title }}</fwb-badge>
                    </fwb-table-cell>
                    <fwb-table-cell @click="(e) => e.preventDefault()">
                        <User :show-name="false" :user="obj.user" />
                    </fwb-table-cell>
                    <fwb-table-cell>
                        <router-link
                            :to="{
                                name: 'project.tasks',
                                params: { project: obj.project_id },
                                query: { task: obj.task_id },
                            }"
                        >Open</router-link>
                    </fwb-table-cell>
                </fwb-table-row>
            </fwb-table-body>
        </fwb-table>
        <fwb-alert v-if="tasks.length === 0" type="info" class="w-full">
            <span>You don't have any tasks that are open under your name</span>
        </fwb-alert>
    </FwbCard>
</template>

<style scoped></style>
