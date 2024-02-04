<script setup>
import { useBoardsState } from "../../../../../store/boards.ts";
import { onBeforeUnmount, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import StatusRow from "./StatusRow.vue";
import _ from "lodash";
import { useBreadcrumbStore } from "../../../../../store/breadcrumb";

const route = useRoute();
const boardState = useBoardsState();
const breadcrumbStore = useBreadcrumbStore();

const loadStatuses = () => {
    axios
        .get(`/api/v1/tasks-statuses/`, {
            params: {
                project_id: route.params.project,
                board_id: boardState.activeBoard.id,
            },
        })
        .then((res) => {
            boardState.setStatuses(res.data.data);
        });
};

onMounted(() => {
    Echo.private(`task-updated.${route.params.project}`).listen(
        "TaskUpdatedEvent",
        ({ task, oldStatus }) => {
            boardState.updateTask(oldStatus, task);
        }
    );
});

function manageBreadcrumb() {
    if (
        _.findIndex(breadcrumbStore.links, {
            title: boardState.activeBoard.title,
        }) === -1
    ) {
        breadcrumbStore.addEntry([
            {
                link: "",
                title: boardState.activeBoard.title,
            },
        ]);
    }
    if (
        _.findIndex(breadcrumbStore.links, {
            title: boardState.activeSprint.title,
        }) === -1 &&
        boardState.activeBoard.type === "scrum"
    ) {
        breadcrumbStore.addEntry([
            {
                link: {
                    name: "project.board.view",
                    params: {
                        board: boardState.activeBoard.id,
                        sprint: boardState.activeSprint.id,
                    },
                },
                title: boardState.activeBoard.title,
            },
            {
                link: {
                    name: "project.board.view",
                    params: {
                        board: boardState.activeBoard.id,
                        sprint: boardState.activeSprint.id,
                    },
                },
                title: boardState.activeSprint.title,
            },
        ]);
    }
}

watch(
    () => boardState.activeBoard.id,
    (value, oldValue, onCleanup) => {
        loadStatuses();
        manageBreadcrumb();
    },
    {
        immediate: true,
    }
);

onBeforeUnmount(() => {
    breadcrumbStore.addEntry([]);
});
</script>

<template>
    <div
        v-if="boardState.getBoards.length > 0"
        :key="route.params.sprint"
        class="flex w-full gap-4 overflow-auto pb-4"
    >
        <StatusRow
            v-for="status in boardState.taskStatuses"
            :key="status.id"
            :status="status"
        />
    </div>
</template>

<style scoped></style>
