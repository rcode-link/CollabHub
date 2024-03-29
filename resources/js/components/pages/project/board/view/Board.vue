<script setup lang="js">
import { useBoardsState } from "../../../../../store/boards";
import { onBeforeUnmount, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import StatusRow from "./StatusRow.vue";
import { findIndex } from "lodash";
import { useBreadcrumbStore } from "../../../../../store/breadcrumb";

const route = useRoute();
const boardState = useBoardsState();
const breadcrumbStore = useBreadcrumbStore();

const loadStatuses = () => {
    window.axios
        .get(`/api/v1/tasks-statuses/`, {
            params: {
                project_id: route.params.project,
                board_id: boardState.activeBoard?.id,
            },
        })
        .then((res) => {
            boardState.setStatuses(res.data.data);
        });
};

onMounted(() => {
    window.Echo.private(`task-updated.${route.params.project}`).listen(
        "TaskUpdatedEvent",
        ({ task, oldStatus }) => {
            boardState.updateTask(oldStatus, task);
        }
    );
});

function manageBreadcrumb() {
    if (
        findIndex(breadcrumbStore.links, {
            //@ts-ignore
            title: boardState.activeBoard?.title,
        }) === -1
    ) {
        breadcrumbStore.addEntry([
            {
                link: "",
                title: boardState.activeBoard?.title,
            },
        ]);
    }
    if (
        findIndex(breadcrumbStore.links, {
            //@ts-ignore
            title: boardState.activeSprint?.title,
        }) === -1 &&
        boardState.activeBoard?.type === "scrum"
    ) {
        breadcrumbStore.addEntry([
            {
                link: {
                    name: "project.board.view",
                    params: {
                        board: boardState.activeBoard.id,
                        sprint: boardState.activeSprint?.id,
                    },
                },
                title: boardState.activeBoard.title,
            },
            {
                link: {
                    name: "project.board.view",
                    params: {
                        board: boardState.activeBoard.id,
                        sprint: boardState.activeSprint?.id,
                    },
                },
                title: boardState.activeSprint?.title,
            },
        ]);
    }
}

watch(
    () => boardState.activeBoard?.id,
    (newVal, __oldVal) => {
        boardState.setStatuses([]);

        if (!newVal) {
            return;
        }
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
        class="flex w-full gap-4 overflow-auto pb-4"
        :key="boardState.activeBoard?.id?.toString()"
    >
        <StatusRow
            v-for="status in boardState.taskStatuses"
            :key="status.id"
            :status="{
                id: status.id,
                title: status.title,
            }"
        />
    </div>
</template>

<style scoped></style>
