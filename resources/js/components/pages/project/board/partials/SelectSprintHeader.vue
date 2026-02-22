<template>
    <div class="relative flex-shrink-0" ref="sprintDropdownEl">
        <button
            @click="sprintOpen = !sprintOpen"
            class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
            <div class="flex flex-col items-start leading-tight" :key="boardsState.activeSprint?.id">
                <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ boardsState.activeSprint?.title }}</span>
                <span v-if="boardsState.activeSprint?.start_time" class="text-xs text-gray-400 dark:text-gray-500">
                    {{ DateTime.fromSQL(boardsState.activeSprint.start_time).toLocaleString(DateTime.DATE_SHORT) }}
                    –
                    {{ DateTime.fromSQL(boardsState.activeSprint.end_time).toLocaleString(DateTime.DATE_SHORT) }}
                </span>
            </div>
            <svg
                class="w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform"
                :class="sprintOpen && 'rotate-180'"
                viewBox="0 0 20 20"
                fill="currentColor"
            >
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
        </button>

        <Transition name="dropdown">
            <div
                v-if="sprintOpen"
                class="absolute top-full left-0 mt-1 w-64 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg py-1 z-50"
            >
                <div
                    v-for="obj in boardsState.getActiveBoard?.sprint"
                    :key="obj.id"
                    class="flex items-center justify-between px-3 py-2 text-sm transition-colors"
                    :class="obj.id === boardsState.activeSprint?.id
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'"
                >
                    <span
                        class="font-medium"
                        :class="obj.id === boardsState.activeSprint?.id
                            ? 'text-blue-700 dark:text-blue-400'
                            : 'text-gray-700 dark:text-gray-300'"
                    >
                        {{ obj.title }}
                    </span>
                    <div class="flex items-center gap-2 flex-shrink-0">
                        <button
                            v-if="!obj.is_active && !obj.end_time"
                            @click="() => { setActiveSprint(obj); sprintOpen = false; }"
                            class="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Activate
                        </button>
                        <router-link
                            v-if="obj.id !== boardsState.activeSprint?.id"
                            :to="{ params: { sprint: obj.id } }"
                            @click="sprintOpen = false"
                            class="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:underline"
                        >
                            Open
                        </router-link>
                    </div>
                </div>

                <div v-if="can(`can-create-board.${route.params.project}`)" class="border-t border-gray-100 dark:border-gray-700 my-1" />
                <button
                    v-if="can(`can-create-board.${route.params.project}`)"
                    @click="() => { createSprintRef.toggleModal(); sprintOpen = false; }"
                    class="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                    <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    Create new sprint
                </button>
            </div>
        </Transition>

        <!-- Create sprint modal -->
        <Modal ref="createSprintRef">
            <template #header>Create new sprint</template>
            <template #body>
                <form @submit.prevent="createSprint" class="space-y-4">
                    <div>
                        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Sprint title *</label>
                        <input
                            v-model="form.title"
                            type="text"
                            placeholder="e.g. Sprint 1"
                            class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Duration (days) *</label>
                        <input
                            v-model="form.duration"
                            type="number"
                            placeholder="14"
                            class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    <label class="flex items-center gap-2.5 cursor-pointer">
                        <input
                            type="checkbox"
                            v-model="form.is_active"
                            class="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-1"
                        />
                        <span class="text-sm text-gray-700 dark:text-gray-300">Activate immediately</span>
                    </label>
                </form>
            </template>
            <template #footer>
                <Button @click="() => createSprint()">Save sprint</Button>
            </template>
        </Modal>
    </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { onClickOutside } from "@vueuse/core";
import { useBoardsState } from "../../../../../store/boards";
import { DateTime } from "luxon";
import { useAbility } from "@casl/vue";
import Modal from "../../../../shared/Modal.vue";
import Button from "../../../../shared/Button.vue";

const route = useRoute();
const boardsState = useBoardsState();
const { can } = useAbility();

const sprintOpen = ref(false);
const sprintDropdownEl = ref(null);
const createSprintRef = ref(null);
const form = reactive({ title: "", duration: null, is_active: false });

onClickOutside(sprintDropdownEl, () => { sprintOpen.value = false; });

const createSprint = () => {
    axios.post("/api/v1/sprints", {
        ...form,
        board_id: boardsState.activeBoard.id,
    }).then((res) => {
        createSprintRef.value.toggleModal();
        boardsState.addSprintToBoard(res.data);
        boardsState.setActiveSprint(res.data.id);
    });
};

const setActiveSprint = (obj) => {
    axios.put(`/api/v1/sprints/${obj.id}/activate`);
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
