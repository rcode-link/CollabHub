<script setup lang="js">
import AutoComplete from "@/components/shared/AutoComplete.vue";
import { ref, watch } from "vue";
import { useRoute } from "vue-router";

const emit = defineEmits(["update"]);
const route = useRoute();
const taskRelations = ref({ data: [] });
const relatedTasks = ref({ data: [] });
const selectedItems = ref([]);

const searchTasks = (value) => {
    window.axios
        .get("/api/v1/tasks/search", {
            params: { project_id: route.params.project, search: value },
        })
        .then((res) => { relatedTasks.value = res.data; });
};

const getTaskRelations = () => {
    window.axios.get("/api/v1/task/relations").then((res) => (taskRelations.value = res.data));
};

const itemSelected = (id) => {
    selectedItems.value.push({
        task: relatedTasks.value.data.find(obj => obj.id === Number(id)),
    });
};

const removeItem = (index) => {
    selectedItems.value.splice(index, 1);
};

getTaskRelations();

watch(selectedItems, () => { emit("update", selectedItems); }, { deep: true });
</script>

<template>
    <div class="space-y-2">
        <AutoComplete
            :items="relatedTasks?.data?.map((obj) => ({ value: obj.id, label: obj.task_id + ' — ' + obj.name }))"
            @search="searchTasks"
            @selected="itemSelected"
        />
        <div v-if="selectedItems.length" class="space-y-1.5">
            <div
                v-for="(obj, index) in selectedItems"
                :key="index"
                class="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
            >
                <select
                    :key="obj.task_relation_id"
                    v-model="obj.task_relation_id"
                    class="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1 text-xs text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 flex-shrink-0"
                >
                    <option value="">Relation type</option>
                    <option v-for="r in taskRelations.data" :key="r.id" :value="r.id.toString()">{{ r.name }}</option>
                </select>
                <span class="flex-1 text-xs text-gray-700 dark:text-gray-300 truncate">
                    <span class="font-mono text-gray-400">{{ obj.task?.task_id }}</span>
                    {{ obj.task?.name }}
                </span>
                <button
                    type="button"
                    @click="removeItem(index)"
                    class="flex-shrink-0 p-0.5 text-gray-400 hover:text-red-500 transition-colors"
                >
                    <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>
