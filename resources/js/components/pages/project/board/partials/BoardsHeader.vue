<template>
    <div class="flex items-center gap-2 w-full min-w-0">
        <!-- Board selector -->
        <div class="relative flex-shrink-0" ref="boardDropdownEl">
            <button
                @click="toggleBoardDropdown()"
                class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
                <KanbanIcon class="w-3 h-3 text-blue-500 flex-shrink-0" v-if="boardsState.activeBoard?.type === 'kanban'" />
                <ScrumIcon class="w-3 h-3 text-purple-500 flex-shrink-0" v-if="boardsState.activeBoard?.type === 'scrum'" />
                <span class="truncate max-w-[180px]">{{ boardsState.activeBoard?.title }}</span>
                <svg class="w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform" :class="boardOpen && 'rotate-180'" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>

            <Transition name="dropdown">
                <div
                    v-if="boardOpen"
                    class="absolute top-full left-0 mt-1 w-56 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg py-1 z-50"
                >
                    <button
                        v-for="obj in boardsState.getBoards"
                        :key="obj.id"
                        @click="() => { setActiveBoard(obj); boardOpen = false; }"
                        class="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-left transition-colors"
                        :class="obj.id === boardsState.activeBoard?.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'"
                    >
                        <KanbanIcon class="w-3 h-3 flex-shrink-0 opacity-60" v-if="obj.type === 'kanban'" />
                        <ScrumIcon class="w-3 h-3 flex-shrink-0 opacity-60" v-if="obj.type === 'scrum'" />
                        {{ obj.title }}
                    </button>

                    <div v-if="can(`can-create-board.${route.params.project}`)" class="border-t border-gray-100 dark:border-gray-700 my-1" />
                    <button
                        v-if="can(`can-create-board.${route.params.project}`)"
                        @click="() => { boardModalRef.toggleModal(); boardOpen = false; }"
                        class="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                        <svg class="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        Add new board
                    </button>
                </div>
            </Transition>
        </div>

        <!-- Separator -->
        <div v-if="shouldSprintSelectionBeVisible" class="w-px h-4 bg-gray-200 dark:bg-gray-700 flex-shrink-0" />

        <!-- Sprint selector -->
        <SelectSprintHeader v-if="shouldSprintSelectionBeVisible" />

        <!-- Settings - pushed right -->
        <div
            class="relative ml-auto flex-shrink-0"
            ref="settingsDropdownEl"
            v-if="can(`can-update-board.${route.params.project}`)"
        >
            <button
                @click="toggleSettingsDropdown()"
                class="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Board settings"
            >
                <CogsIcon class="w-4 h-4" />
            </button>

            <Transition name="dropdown">
                <div
                    v-if="settingsOpen"
                    class="absolute top-full right-0 mt-1 w-48 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg py-1 z-50"
                >
                    <router-link
                        :to="{ name: 'project.board.settings', params: route.params }"
                        @click="settingsOpen = false"
                        class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                        Board settings
                    </router-link>
                </div>
            </Transition>
        </div>

        <!-- Create board modal -->
        <Modal ref="boardModalRef">
            <template #header>Create new board</template>
            <template #body>
                <BoardForm @saved="() => boardModalRef.closeModal()" />
            </template>
        </Modal>
    </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDropdown } from "@/composables/useDropdown";
import KanbanIcon from "@/components/shared/icons/KanbanIcon.vue";
import ScrumIcon from "@/components/shared/icons/ScrumIcon.vue";
import { useBoardsState } from "@/store/boards";
import SelectSprintHeader from "@/components/pages/project/board/partials/SelectSprintHeader.vue";
import Modal from "@/components/shared/Modal.vue";
import BoardForm from "@/components/pages/project/board/partials/Form.vue";
import CogsIcon from "@/components/shared/icons/CogsIcon.vue";
import { useAbility } from "@casl/vue";

const route = useRoute();
const router = useRouter();
const boardsState = useBoardsState();
const boardModalRef = ref(null);
const { can } = useAbility();

const { open: boardOpen, el: boardDropdownEl, toggle: toggleBoardDropdown } = useDropdown();
const { open: settingsOpen, el: settingsDropdownEl, toggle: toggleSettingsDropdown } = useDropdown();

const shouldSprintSelectionBeVisible = computed(
    () => boardsState.getActiveBoard?.type === "scrum"
);

const setActiveBoard = ({ id }) => {
    if (Number(id) === Number(route.params.board)) return;
    const routeData = { ...route.params };
    delete routeData["sprint"];
    routeData["board"] = id;
    localStorage.setItem(`last_active_board_${route.params.project}`, id);
    boardsState.taskStatuses = [];
    router.push({ params: routeData, query: route.query });
};
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
    transition: opacity 0.1s ease, transform 0.1s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}
</style>
