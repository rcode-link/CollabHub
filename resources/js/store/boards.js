import {defineStore} from "pinia";
import {computed, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import _ from "lodash";


export const useBoardsState =
    defineStore('boards', () => {
        const boards = ref([]);
        const activeBoard = ref({id: null, title: 'Select board', type: null, sprint: []});
        const activeSprint = ref({id: null, title: 'Select sprint'});
        const boardTasks = ref({});
        const taskStatuses = ref([]);
        const isLoading = ref(true);

        const draggedTask = ref(null);
        const router = useRouter();
        const route = useRoute();

        function changeTaskStatus(status) {
            if (draggedTask.value.status.id === status.id) {
                return;
            }
            const index =
                boardTasks.value[draggedTask.value.status.title].indexOf(draggedTask.value)
            boardTasks.value[draggedTask.value.status.title].splice(index, 1);

            draggedTask.value.status = status;
            boardTasks.value[status.title].push(draggedTask.value)
        }


        function addSprintToBoard(sprint) {
            const indexOfBoard = _.findIndex(boards.value, {id: _.toNumber(activeBoard.value.id)});
            boards.value[indexOfBoard].sprint.push(sprint);
        }


        function updateTask(oldStatusId, task) {

            if (!route.params.sprint) {
                return;
            }
            const statusTitle = {
                title: ''
            }
            taskStatuses.value.forEach((status) => {
                if (_.find(boardTasks.value[status.title], {id: _.toNumber(task.id)})) {
                    statusTitle.title = status.title;
                }
            })
            if (statusTitle.title === '') {
                return;
            }
            const index = _.findIndex(boardTasks.value[statusTitle.title], {
                'id': task.id
            })
            if(index === -1){
                return;
            }
            let status = task.status;
            if (_.isArray(task.status)) {
                status = _.find(status, (obj) => {
                    return obj.sprint.id === _.toNumber(route.params.sprint);
                })
            }
            boardTasks.value[statusTitle.title].splice(index, 1);
            boardTasks.value[status.title].push(task)
        }

        function setDraggedTaskId(val) {
            draggedTask.value = val;
        }

        function setStatuses(statuses) {
            taskStatuses.value = statuses;
        }

        function setTasks(status, tasks, page) {
            if (page === 1) {
                boardTasks.value[status] = tasks;
                return;
            }
            boardTasks.value[status].push(...tasks);
        }

        function setBoards(list, form = null) {
            boards.value = list;
        }

        watch(() => [route.params.board, boards], () => {
            if (!boards.value.length || !route.params.board) {
                return;
            }
            activeBoard.value = _.find(boards.value, {
                'id': _.toNumber(route.params.board)
            });

        }, {
            immediate: true,
            deep: true
        })

        watch(() => [activeBoard.value], () => {
            const data = _.find(activeBoard.value.sprint, obj => obj.id === _.toNumber(route.params.sprint));

            if (route.params.sprint && data) {
                activeSprint.value = _.find(activeBoard.value.sprint, obj => obj.id === _.toNumber(route.params.sprint));
                return;
            }
            let sprintToBeActive = _.find(activeBoard.value.sprint, obj => obj.is_active);
            if (!sprintToBeActive) {
                return;
            }
            router.push({
                params: {
                    sprint: sprintToBeActive.id
                },
                query: route.query
            })
        })

        watch(() => route.params.sprint, () => {
            if (!route.params.sprint) {
                return;
            }
            activeSprint.value = _.find(activeBoard.value.sprint, obj => obj.id === _.toNumber(route.params.sprint));
        }, {
            immediate: true,
            deep: true
        })

        const loadBoards = () => {
            activeBoard.value = {id: null, title: 'Select board', type: null, sprint: []};
            activeSprint.value = {id: null, title: 'Select sprint'};
            isLoading.value = true;
            axios.get('/api/v1/boards', {
                params: {
                    project_id: route.params.project
                }
            }).then(res => {
                setBoards(res.data)
                isLoading.value = false;
                const lastActiveBoard = localStorage.getItem(`last_active_board_${route.params.project}`);
                if (lastActiveBoard) {
                    router.push({
                        params: {
                            board: lastActiveBoard
                        },
                        query: route.query
                    })
                }
            });
        }

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
            isLoading
        }
})
