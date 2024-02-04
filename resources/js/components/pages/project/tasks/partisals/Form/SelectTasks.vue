<script setup lang="ts">
import AutoComplete from "@/components/shared/AutoComplete.vue";
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { toNumber, find } from "lodash";
import { FwbSelect } from "flowbite-vue";
import { TaskResource } from "@/types";
import { OptionsType } from "flowbite-vue/dist/components/FwbSelect/types";

const emit = defineEmits(["update"]);
const route = useRoute();
const taskRelations = ref<{
    data: TaskResource[];
}>({
    data: [],
});
const relatedTasks = ref<{
    data: TaskResource[];
}>({
    data: [],
});
interface iSelectedTask {
    task_relation_id?: string;
    task: TaskResource;
}
const selectedItems = ref<iSelectedTask[]>([]);

const searchTasks = (value: any) => {
    window.axios
        .get("/api/v1/tasks/search", {
            params: {
                project_id: route.params.project,
                search: value,
            },
        })
        .then((res) => {
            relatedTasks.value = res.data;
        });
};

const getTaskRelations = () => {
    window.axios
        .get("/api/v1/task/relations")
        .then((res) => (taskRelations.value = res.data));
};

const itemSelected = (id: number) => {
    selectedItems.value.push({
        //@ts-ignore
        task: find(relatedTasks.value.data, { id: toNumber(id) }),
    });
};

getTaskRelations();

watch(
    selectedItems,
    () => {
        emit("update", selectedItems);
    },
    {
        deep: true,
    }
);
const relations = (): OptionsType[] => {
    const list: OptionsType[] = [];
    taskRelations.value.data.forEach((item) => {
        list.push({
            value: item.id.toString(),
            name: item.name,
        });
    });

    return list;
};
</script>

<template>
    <div>
        <AutoComplete
            :items="
                relatedTasks?.data?.map((obj) => {
                    return {
                        value: obj.id,
                        label: obj.task_id + ' - ' + obj.name,
                    };
                })
            "
            @search="searchTasks"
            @selected="itemSelected"
        />
        <div>
            <div
                class="flex my-2 border-b pb-1 items-center gap-4"
                v-for="obj in selectedItems"
            >
                <fwb-select
                    :key="obj.task_relation_id"
                    v-model="obj.task_relation_id"
                    :options="relations()"
                />
                <b>{{ obj.task.task_id }} </b> {{ obj.task.name }}
            </div>
        </div>
    </div>
</template>

<style scoped></style>
