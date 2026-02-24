<template>
    <div
        @dragstart="dragStarted"
        @dragend="updateTask"
        @click="openTask"
        :draggable="dragEnabled"
        class="rounded-xl border bg-white dark:bg-gray-900 p-3 cursor-pointer select-none transition-all group"
        :class="boardsStore.draggedTask?.id === obj.id
            ? 'opacity-40 border-gray-200 dark:border-gray-700 shadow-none'
            : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm'"
    >
        <!-- Type + ID row -->
        <div class="flex items-center gap-1.5 mb-2">
            <span class="text-xs font-mono text-gray-400 dark:text-gray-500">{{ obj.task_id }}</span>
            <span
                v-if="obj.type?.title"
                class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
            >
                <span
                    v-if="obj.type.colour"
                    class="w-2 h-2 rounded-full flex-shrink-0"
                    :style="{ backgroundColor: obj.type.colour }"
                ></span>
                {{ obj.type.title }}
            </span>
            <div class="ml-auto">
                <span
                    v-if="obj.due_date"
                    class="flex items-center gap-1 text-xs"
                    :class="isPastDue ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'"
                >
                    <svg class="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {{ DateTime.fromISO(obj.due_date).toLocaleString(DateTime.DATE_SHORT) }}
                </span>
            </div>
        </div>

        <!-- Task name -->
        <p class="text-sm font-medium text-gray-900 dark:text-white leading-snug mb-2.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {{ obj.name }}
        </p>

        <!-- Tags (clickable to filter) -->
        <div v-if="obj.tags?.length" class="flex flex-wrap gap-1 mb-2.5">
            <button
                v-for="(tag, idx) in obj.tags"
                :key="idx"
                type="button"
                @click="(e) => filterByTag(tag, e)"
                class="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer"
                title="Filter by this tag"
            >
                {{ tag }}
            </button>
        </div>

        <!-- Footer: assignee -->
        <div class="flex items-center justify-end">
            <tippy :content="userName">
                <UserIcon avatar-size="xs" :user="obj.user" />
            </tippy>
        </div>
    </div>
</template>

<script setup>
import { computed, inject } from "vue";
import { DateTime } from "luxon";
import UserIcon from "@/components/shared/UserIcon.vue";
import { useBoardsState } from "@/store/boards";
import { useRoute, useRouter } from "vue-router";
import { Tippy } from "vue-tippy";

const boardsStore = useBoardsState();
const router = useRouter();
const route = useRoute();

const props = defineProps({ obj: {}, dragEnabled: { type: Boolean, default: true } });

const setTagFilter = inject("setTagFilter", null);
const filterByTag = (tag, e) => {
    e.stopPropagation();
    if (setTagFilter) setTagFilter(tag);
};

const isPastDue = computed(() =>
    props.obj.due_date && DateTime.fromISO(props.obj.due_date) < DateTime.now()
);

const userName = computed(() => props.obj.user?.name ?? "Unassigned");

const dragStarted = (e) => {
    boardsStore.setDraggedTaskId(props.obj);
    if (e.dataTransfer) {
        e.dataTransfer.setData("text/plain", props.obj.id.toString());
        e.dataTransfer.effectAllowed = "move";
    }
};

const updateTask = () => {
    axios.put("/api/v1/tasks/change-status", {
        status_id: boardsStore.draggedTask.status.id,
        sprint_id: route.params.sprint,
        task_id: boardsStore.draggedTask.id,
    }).then(() => boardsStore.setDraggedTaskId(null));
};

const openTask = () => {
    router.push({
        ...route,
        query: { ...route.query, task: props.obj.task_id },
    });
};
</script>
