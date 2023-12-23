import {defineStore} from "pinia";

export const useTasksStore = defineStore('tasksStore', {
    state: () => ({showCreateTasksModal: false, tasks: {}}),
    actions: {
        toggleCreateTaskModal() {
            this.showCreateTasksModal = !this.showCreateTasksModal;
        },
        loadTasks(queryData){
            axios.get('/api/v1/tasks', {
                params: queryData
            }).then(res => this.tasks = res.data)
        }
    },
})
