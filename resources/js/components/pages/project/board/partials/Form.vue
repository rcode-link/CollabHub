<template>
    <!-- Step 1: Choose board type -->
    <div v-if="step === 1" class="space-y-3">
        <p class="text-xs text-gray-500 dark:text-gray-400">
            Choose the methodology that fits your team's workflow.
        </p>

        <!-- Kanban card -->
        <button
            @click="selectType('kanban')"
            class="flex items-start gap-4 w-full p-4 rounded-xl border-2 text-left transition-all"
            :class="form.type === 'kanban'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'"
        >
            <div class="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                <KanbanIcon class="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div class="pt-0.5">
                <div class="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">Kanban</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Continuous flow board with no time-boxed iterations. Great for support, maintenance, or ongoing work.
                </div>
            </div>
            <div class="flex-shrink-0 ml-auto">
                <div class="w-4 h-4 rounded-full border-2 transition-all mt-0.5"
                    :class="form.type === 'kanban' ? 'border-blue-500 bg-blue-500' : 'border-gray-300 dark:border-gray-600'">
                    <div v-if="form.type === 'kanban'" class="w-1.5 h-1.5 bg-white rounded-full mx-auto mt-px"></div>
                </div>
            </div>
        </button>

        <!-- Scrum card -->
        <button
            @click="selectType('scrum')"
            class="flex items-start gap-4 w-full p-4 rounded-xl border-2 text-left transition-all"
            :class="form.type === 'scrum'
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'"
        >
            <div class="w-11 h-11 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0">
                <ScrumIcon class="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div class="pt-0.5">
                <div class="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">Scrum</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Time-boxed sprints with structured planning and reviews. Ideal for product development teams.
                </div>
            </div>
            <div class="flex-shrink-0 ml-auto">
                <div class="w-4 h-4 rounded-full border-2 transition-all mt-0.5"
                    :class="form.type === 'scrum' ? 'border-purple-500 bg-purple-500' : 'border-gray-300 dark:border-gray-600'">
                    <div v-if="form.type === 'scrum'" class="w-1.5 h-1.5 bg-white rounded-full mx-auto mt-px"></div>
                </div>
            </div>
        </button>
    </div>

    <!-- Step 2: Board details -->
    <div v-else class="space-y-4">
        <!-- Back + selected type badge -->
        <div class="flex items-center gap-3">
            <button
                @click="step = 1"
                class="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
            </button>
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <KanbanIcon v-if="form.type === 'kanban'" class="w-3.5 h-3.5 text-blue-500" />
                <ScrumIcon v-else class="w-3.5 h-3.5 text-purple-500" />
                <span class="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">{{ form.type }} board</span>
            </div>
        </div>

        <!-- Board name -->
        <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Board name *</label>
            <input
                v-model="form.title"
                type="text"
                placeholder='e.g. "Product Backlog"'
                autofocus
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
        </div>

        <!-- Scrum: first sprint setup -->
        <template v-if="form.type === 'scrum'">
            <div class="pt-3 border-t border-gray-100 dark:border-gray-700">
                <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">First sprint</p>
                <div class="space-y-3">
                    <div>
                        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Sprint name</label>
                        <input
                            v-model="form.sprint_title"
                            type="text"
                            placeholder="Sprint 1"
                            class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Duration (days)</label>
                        <input
                            v-model="form.sprint_duration"
                            type="number"
                            min="1"
                            placeholder="14"
                            class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>
        </template>

        <!-- Submit -->
        <Button
            :disabled="!form.title.trim() || saving"
            class="w-full justify-center !mt-5"
            @click="submit"
        >
            <svg v-if="saving" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
            {{ saving ? 'Creating…' : `Create ${form.type === 'kanban' ? 'Kanban' : 'Scrum'} board` }}
        </Button>
    </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { useBoardsState } from "../../../../../store/boards";
import KanbanIcon from "../../../../shared/icons/KanbanIcon.vue";
import ScrumIcon from "../../../../shared/icons/ScrumIcon.vue";
import Button from "../../../../shared/Button.vue";

const route = useRoute();
const boardsState = useBoardsState();
const emit = defineEmits(['saved']);

const step = ref(1);
const saving = ref(false);

const form = reactive({
    title: "",
    type: null,
    sprint_title: "Sprint 1",
    sprint_duration: 14,
});

const selectType = (type) => {
    form.type = type;
    step.value = 2;
};

const reset = () => {
    step.value = 1;
    form.title = "";
    form.type = null;
    form.sprint_title = "Sprint 1";
    form.sprint_duration = 14;
};

const submit = async () => {
    if (!form.title.trim()) return;
    saving.value = true;
    try {
        const { data: board } = await axios.post("/api/v1/boards", {
            title: form.title,
            type: form.type,
            project_id: route.params.project,
        });

        // For scrum boards: create the first sprint
        if (form.type === 'scrum' && form.sprint_title.trim()) {
            await axios.post("/api/v1/sprints", {
                title: form.sprint_title,
                duration: form.sprint_duration,
                is_active: true,
                board_id: board.id ?? board.data?.id,
            }).catch(() => {}); // non-fatal if sprint creation fails
        }

        await boardsState.loadBoards();
        emit('saved');
        reset();
    } finally {
        saving.value = false;
    }
};

// Kept for backward compatibility (used in Index.vue empty state)
defineExpose({ submit });
</script>
