<script setup>
import { onMounted, reactive, ref, computed } from "vue";
import { DateTime } from "luxon";
import { useRoute } from "vue-router";
import { groupBy, sumBy } from "lodash";
import UserTimeSheet from "@/components/pages/project/tasks/partisals/details/time_sheet/UserTimeSheet.vue";
import Button from "@/components/shared/Button.vue";
import Text from "@/components/shared/Text.vue";
import Badge from "@/components/shared/ui/Badge.vue";

const model = ref({});
const saving = ref(false);
const route = useRoute();
const props = defineProps({ taskId: null });

const form = reactive({ start: null, hours: null, minutes: null, task_id: props.taskId });

const canSubmit = computed(() => {
    if (!form.start) return false;
    const h = parseInt(form.hours) || 0;
    const m = parseInt(form.minutes) || 0;
    return (h + m) > 0;
});

const totalHours = computed(() => {
    const all = Object.values(model.value).flat();
    return sumBy(all, obj =>
        Number(DateTime.fromISO(obj.end).diff(DateTime.fromISO(obj.start), ["hours"]).hours)
    ).toFixed(2);
});

const submit = () => {
    if (!canSubmit.value) return;
    const h = parseInt(form.hours) || 0;
    const m = parseInt(form.minutes) || 0;
    const startDt = DateTime.fromISO(form.start);
    const endDt = startDt.plus({ hours: h, minutes: m });
    saving.value = true;
    window.axios
        .post("/api/v1/time-sheet", {
            start: startDt.toISO(),
            end: endDt.toISO(),
            task_id: form.task_id,
            project_id: route.params.project,
        })
        .then(() => { load(); form.start = null; form.hours = null; form.minutes = null; })
        .finally(() => { saving.value = false; });
};

const load = () => {
    window.axios
        .get("/api/v1/time-sheet", {
            params: { project_id: route.params.project, task_id: props.taskId },
        })
        .then((res) => (model.value = groupBy(res.data, "user_id")));
};

onMounted(() => { load(); });
</script>

<template>
    <div class="space-y-4">

        <!-- Add entry form -->
        <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <form @submit.prevent="submit" class="flex items-end gap-3 flex-wrap">
                <div class="min-w-[160px]">
                    <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Start time</label>
                    <Text
                        :model-value="form.start"
                        @update:model-value="form.start = $event"
                        type="datetime-local"
                        name="start"
                    />
                </div>
                <div class="flex gap-2">
                    <div class="w-20">
                        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Hours</label>
                        <Text
                            :model-value="form.hours"
                            @update:model-value="form.hours = $event"
                            type="number"
                            name="hours"
                            placeholder="0"
                        />
                    </div>
                    <div class="w-20">
                        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Minutes</label>
                        <Text
                            :model-value="form.minutes"
                            @update:model-value="form.minutes = $event"
                            type="number"
                            name="minutes"
                            placeholder="0"
                        />
                    </div>
                </div>
                <Button type="submit" :disabled="!canSubmit || saving" size="sm">
                    <svg v-if="saving" class="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 12a9 9 0 11-6.219-8.56"/>
                    </svg>
                    Add
                </Button>
            </form>
        </div>

        <!-- Total hours badge -->
        <div v-if="Object.keys(model).length" class="flex items-center gap-2">
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Total logged:</span>
            <Badge color="gray"><span class="tabular-nums font-bold">{{ totalHours }}h</span></Badge>
        </div>

        <!-- Per-user entries -->
        <div v-if="Object.keys(model).length" class="space-y-3">
            <UserTimeSheet
                v-for="key in Object.keys(model)"
                :key="key"
                :model="model[key]"
                @deleted="load"
            />
        </div>

        <p v-else class="text-sm text-gray-400 dark:text-gray-500 italic">No time entries yet.</p>
    </div>
</template>
