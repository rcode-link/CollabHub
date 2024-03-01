import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { findIndex, toNumber, find, isArray } from "lodash";

export const useBoardsState = defineStore("boards", () => {
    const boards = ref([]);
    const activeBoard = ref();
    const activeSprint = ref();
    const boardTasks = ref({});
    const taskStatuses = ref([]);
    const isLoading = ref(true);

    const draggedTask = ref();
    const router = useRouter();
    const route = useRoute();

    function changeTaskStatus(status) {
        if (!draggedTask.value) {
            return;
        }
        if (draggedTask.value?.status?.id === status.id) {
            return;
        }
        const index = boardTasks.value[draggedTask.value.status.title].indexOf(
            draggedTask.value
        );
        boardTasks.value[draggedTask.value.status.title].splice(index, 1);

        draggedTask.value.status = status;
        boardTasks.value[status.title].push(draggedTask.value);
    }

    function addSprintToBoard(sprint) {
        const indexOfBoard = findIndex(boards.value, {
            id: toNumber(activeBoard.value?.id),
        });
        boards.value[indexOfBoard].sprint.push(sprint);
    }

    //@ts-ignore
    function updateTask(oldStatusId, task) {
        if (!route.params.sprint) {
            return;
        }
        const statusTitle = {
            title: "",
        };
        taskStatuses.value.forEach((status) => {
            if (
                find(boardTasks.value[status.title], {
                    id: toNumber(task.id),
                })
            ) {
                statusTitle.title = status.title;
            }
        });
        if (statusTitle.title === "") {
            return;
        }
        const index = findIndex(boardTasks.value[statusTitle.title], {
            id: task.id,
        });
        if (index === -1) {
            return;
        }
        let status = task.status;
        if (isArray(task.status)) {
            status = find(status, (obj) => {
                return obj.sprint.id === toNumber(route.params.sprint);
            });
        }
        boardTasks.value[statusTitle.title].splice(index, 1);
        boardTasks.value[status.title].push(task);
    }

    function setDraggedTaskId(val) {
        draggedTask.value = val;
    }

    function setStatuses(statuses) {
        taskStatuses.value = statuses;
    }

    //@ts-ignore
    function setTasks(status, tasks, page) {
        if (page === 1) {
            boardTasks.value[status] = tasks;
            return;
        }
        boardTasks.value[status].push(...tasks);
    }

    //@ts-ignore
    function setBoards(list, form = null) {
        boards.value = list;
    }

    watch(
        () => [route.params.board, boards],
        () => {
            if (!boards.value.length || !route.params.board) {
                return;
            }
            activeBoard.value = find(boards.value, {
                id: toNumber(route.params.board),
            });
        },
        {
            immediate: true,
            deep: true,
        }
    );

    watch(
        () => [activeBoard.value],
        () => {
            const data = find(
                activeBoard.value?.sprint,
                (obj) => obj.id === toNumber(route.params.sprint)
            );

            if (route.params.sprint && data) {
                activeSprint.value = data;
                return;
            }
            let sprintToBeActive =
                find(activeBoard.value?.sprint, (obj) => obj.is_active) ??
                activeBoard.value?.sprint[0];

            if (!sprintToBeActive) {
                return;
            }
            router.push({
                params: {
                    sprint: sprintToBeActive.id,
                },
                query: route.query,
            });
        }
    );

    watch(
        () => route.params.sprint,
        () => {
            if (!route.params.sprint) {
                return;
            }
            const sprint = find(
                activeBoard.value?.sprint,
                (obj) => obj.id === toNumber(route.params.sprint)
            );
            if (sprint) {
                activeSprint.value = sprint;
            }
        },
        {
            immediate: true,
            deep: true,
        }
    );

    const loadBoards = () => {
        activeBoard.value = {
            id: null,
            title: "Select board",
            type: null,
            project_id: 0,
            created_at: "",
            updated_at: "",
            sprint: [],
        };
        activeSprint.value = {
            id: 0,
            title: "Select sprint",
            board_id: null,
            created_at: null,
            duration: null,
            end_time: null,
            is_active: true,
            start_time: null,
            updated_at: null,
        };
        isLoading.value = true;
        window.axios
            .get("/api/v1/boards", {
                params: {
                    project_id: route.params.project,
                },
            })
            .then((res) => {
                setBoards(res.data);
                isLoading.value = false;
                const lastActiveBoard = localStorage.getItem(
                    `last_active_board_${route.params.project}`
                );
                if (lastActiveBoard) {
                    router.push({
                        params: {
                            board: lastActiveBoard,
                        },
                        query: route.query,
                    });
                }
            });
    };

    const getBoards = computed(() => {
        return boards.value;
    });
    const getActiveBoard = computed(() => {
        return activeBoard.value;
    });
    return {
        changeTaskStatus,
        updateTask,
        setDraggedTaskId,
        setStatuses,
        setTasks,
        setBoards,
        loadBoards,
        addSprintToBoard,
        getBoards,
        getActiveBoard,
        activeBoard,
        activeSprint,
        boards,
        taskStatuses,
        boardTasks,
        draggedTask,
        isLoading,
    };
});
