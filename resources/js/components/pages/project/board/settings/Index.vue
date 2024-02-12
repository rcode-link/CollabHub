<script setup lang="ts">
import Card from "@/components/shared/Card.vue";
import { useRoute } from "vue-router";
import { onMounted, reactive, ref, onBeforeUnmount } from "vue";
import { FwbButton, FwbCheckbox, FwbInput } from "flowbite-vue";
import ArrowDownIcon from "@/components/shared/icons/ArrowDownIcon.vue";
import { useBreadcrumbStore } from "@/store/breadcrumb";
import { useBoardsState } from "@/store/boards.ts";

const boardsState = useBoardsState();
const breadcrumbStore = useBreadcrumbStore();
const route = useRoute();

const statuses = ref([]);
const model = reactive({
    title: "",
    project_id: route.params.project,
    board_id: route.params.board,
});
const loadStatuses = () => {
    window.axios
        .get(`/api/v1/tasks-statuses/`, {
            params: {
                project_id: route.params.project,
                board_id: route.params.board,
            },
        })
        .then((res) => {
            statuses.value = res.data.data;
        });
};

loadStatuses();

const update = (value: any) => {
    window.axios
        .put(`/api/v1/tasks-statuses/${value.id}`, value)
        .then(() => loadStatuses());
};
const create = () => {
    window.axios.post(`/api/v1/tasks-statuses`, model).then(() => {
        loadStatuses();
        model.title = "";
    });
};

onMounted(() => {
    const breadcrumItems = [
        {
            link: {
                name: "project.board.view",
                params: {
                    board: boardsState.activeBoard?.id,
                    sprint: boardsState.activeSprint?.id,
                },
            },
            title: boardsState.activeBoard?.title,
        },
    ];

    if (boardsState.activeSprint?.title) {
        breadcrumItems.push({
            link: {
                name: "project.board.view",
                params: {
                    board: boardsState.activeBoard?.id,
                    sprint: boardsState.activeSprint.id,
                },
            },
            title: boardsState.activeSprint.title,
        });
    }

    //@ts-ignore
    breadcrumItems.push({
        title: "Settings",
    });

    breadcrumbStore.addEntry(breadcrumItems);
});

onBeforeUnmount(() => {
    breadcrumbStore.addEntry([]);
});
</script>

<template>
    <Card>
        <ul class="w-full">
            <li
                v-for="(obj, index) in statuses"
                :data-order="obj.order"
                :key="index"
                class="flex gap-4 mb-1 pr-4 items-center shadow w-full"
            >
                <div class="p-2">
                    <ArrowDownIcon
                        :class="{
                            'w-2 mb-4 bg-gray-50 h-2 rotate-180 cursor-pointer': true,
                            'pointer-events-none cursor-not-allowed':
                                index === 0,
                        }"
                        @click="
                            () => update({ order: obj.order - 1, id: obj.id })
                        "
                    />
                    <ArrowDownIcon
                        :class="{
                            'w-2 mt-4 bg-gray-50 h-2 cursor-pointer': true,
                            'pointer-events-none cursor-not-allowed':
                                index === statuses.length - 1,
                        }"
                        @click="
                            () => update({ order: obj.order + 1, id: obj.id })
                        "
                    />
                </div>
                <fwb-input
                    class="flex-1"
                    size="sm"
                    v-model="obj.title"
                    @keyup.enter.prevent="
                        () => update({ title: obj.title, id: obj.id })
                    "
                />
                <fwb-checkbox
                    label="Is open"
                    v-model="obj.open"
                    @change="() => update({ open: obj.open, id: obj.id })"
                    class="ml-auto"
                    value="1"
                />
            </li>
            <li class="flex gap-1">
                <fwb-input class="flex-1" v-model="model.title" size="sm" />
                <fwb-button size="sm" @click="create">Add status</fwb-button>
            </li>
        </ul>
    </Card>
</template>

<style scoped></style>
