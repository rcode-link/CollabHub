<script setup>
import { onMounted } from "vue";
import BoardForm from "@/components/pages/project/board/partials/Form.vue";
import { useRoute } from "vue-router";
import BoardsHeader from "@/components/pages/project/board/partials/BoardsHeader.vue";
import { useBoardsState } from "@/store/boards";
import { useAbility } from "@casl/vue";

const route = useRoute();
const { can } = useAbility();
const boardsState = useBoardsState();

onMounted(() => {
    boardsState.loadBoards();
});
</script>

<template>
    <div class="flex flex-col -mt-2">
        <!-- Board header bar -->
        <div
            v-if="boardsState.getBoards.length > 0"
            class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 flex items-center"
        >
            <BoardsHeader />
        </div>

        <!-- Loading state -->
        <div v-if="boardsState.isLoading" class="flex justify-center py-16">
            <div class="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        </div>

        <template v-else>
            <!-- Empty state: no boards, can create -->
            <div
                v-if="boardsState.getBoards.length === 0 && can(`can-create-board.${route.params.project}`)"
                class="flex flex-col items-center py-16 px-4"
            >
                <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-8 max-w-md w-full">
                    <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-1">Create your first board</h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mb-5">Set up a Kanban or Scrum board to start tracking work.</p>
                    <BoardForm />
                </div>
            </div>

            <!-- Board content -->
            <div v-if="boardsState.getBoards.length > 0" class="mt-3">
                <router-view></router-view>
            </div>
        </template>
    </div>
</template>
