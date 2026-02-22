<template>
    <div class="flex-shrink-0 w-[272px] flex flex-col" style="height: calc(100vh - 160px)">
        <!-- Column header -->
        <div class="flex items-center justify-between px-1 py-2 mb-1.5 flex-shrink-0">
            <div class="flex items-center gap-2">
                <UserIcon
                    v-if="groupField === 'user_id' && group.user"
                    avatar-size="xs"
                    :user="group.user"
                />
                <div v-else class="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0" />
                <h3 class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {{ group.title }}
                </h3>
            </div>
            <span
                v-if="taskCount > 0"
                class="text-xs text-gray-400 dark:text-gray-500 tabular-nums font-medium"
            >{{ taskCount }}</span>
        </div>

        <!-- Task list -->
        <div
            class="flex-1 overflow-y-auto space-y-2 pb-4 rounded-xl bg-gray-50/60 dark:bg-gray-800/30"
            style="padding: 6px"
        >
            <template v-if="loading">
                <div v-for="n in 3" :key="n" class="h-20 rounded-xl bg-gray-200 dark:bg-gray-700/50 animate-pulse" />
            </template>

            <template v-else>
                <SingleTask
                    v-for="obj in tasks"
                    :key="obj.id"
                    :obj="obj"
                    :drag-enabled="false"
                />

                <div
                    v-if="tasks.length === 0"
                    class="flex items-center justify-center h-16 text-xs text-gray-400 dark:text-gray-500"
                >
                    No tasks
                </div>

                <button
                    v-if="hasMore"
                    @click="loadMore"
                    class="w-full py-2 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
                >
                    Load more
                </button>
            </template>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import SingleTask from './SingleTask.vue';
import UserIcon from '@/components/shared/UserIcon.vue';

const route = useRoute();
const tasks = ref([]);
const loading = ref(false);
const hasMore = ref(false);
const page = ref(1);

const props = defineProps({
    group: { type: Object, required: true },   // { id, title, user? }
    groupField: { type: String, required: true }, // 'user_id' | 'type_id'
    filters: { type: Object, default: () => ({}) },
});

const taskCount = computed(() => tasks.value.length);

const loadTasks = (loadPage = 1) => {
    if (!route.params.sprint) return;

    if (loadPage === 1) {
        loading.value = true;
        tasks.value = [];
    }

    const params = {
        page: loadPage,
        sprint_id: route.params.sprint,
        project_id: route.params.project,
        [props.groupField]: props.group.id,
    };

    // Carry through filters, but skip the field we're already grouping by
    if (props.filters?.search) params.search = props.filters.search;
    if (props.filters?.tag) params.tag = props.filters.tag;
    if (props.filters?.type_id && props.groupField !== 'type_id') params.type_id = props.filters.type_id;
    if (props.filters?.user_id && props.groupField !== 'user_id') params.user_id = props.filters.user_id;

    window.axios
        .get('/api/v1/tasks', { params })
        .then((res) => {
            if (loadPage === 1) tasks.value = res.data.data;
            else tasks.value.push(...res.data.data);
            hasMore.value = res.data.data.length === 10;
            if (hasMore.value) page.value = loadPage + 1;
        })
        .finally(() => { loading.value = false; });
};

const loadMore = () => loadTasks(page.value);

watch(
    () => props.filters,
    () => {
        page.value = 1;
        hasMore.value = false;
        loadTasks(1);
    },
    { deep: true }
);

onMounted(() => loadTasks(1));
</script>
