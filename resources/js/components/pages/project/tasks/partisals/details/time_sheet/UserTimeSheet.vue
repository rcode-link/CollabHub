<script setup>
import { DateTime } from "luxon";
import { computed, ref, watch } from "vue";
import { sumBy, remove } from "lodash";
import UserIcon from "@/components/shared/UserIcon.vue";
import Badge from "@/components/shared/ui/Badge.vue";
import Button from "@/components/shared/Button.vue";

const props = defineProps(["model"]);
const emit = defineEmits(["deleted"]);

const expanded = ref(false);
const items = ref(props.model);
const confirmDeleteId = ref(null);

watch(() => props.model, () => { items.value = props.model; });

const user = computed(() => items.value[0]?.user ?? null);
const userName = computed(() => user.value?.name ?? "Unknown");

const totalHours = computed(() =>
    sumBy(items.value, (obj) =>
        Number(DateTime.fromISO(obj.end).diff(DateTime.fromISO(obj.start), ["hours"]).hours)
    ).toFixed(2)
);

const formatDate = (iso) => DateTime.fromISO(iso).toLocaleString(DateTime.DATETIME_MED);

const getHours = (obj) =>
    Number(DateTime.fromISO(obj.end).diff(DateTime.fromISO(obj.start), ["hours"]).hours).toFixed(2);

const removeEntry = (id) => {
    window.axios.delete(`/api/v1/time-sheet/${id}`).then(() => {
        remove(items.value, { id });
        confirmDeleteId.value = null;
        emit("deleted");
    });
};
</script>

<template>
    <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        <!-- User header (clickable to expand) -->
        <button
            @click="expanded = !expanded"
            class="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
        >
            <UserIcon v-if="user" :user="user" :status="false" avatar-size="xs" />

            <span class="text-sm font-medium text-gray-900 dark:text-white flex-1 truncate">{{ userName }}</span>

            <Badge color="gray" size="xs"><span class="tabular-nums font-bold">{{ totalHours }}h</span></Badge>

            <svg
                class="w-4 h-4 text-gray-400 transition-transform flex-shrink-0"
                :class="expanded && 'rotate-180'"
                viewBox="0 0 20 20" fill="currentColor"
            >
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
        </button>

        <!-- Entries list -->
        <Transition name="expand">
            <div v-if="expanded">
                <!-- Table header -->
                <div class="grid grid-cols-[1fr_1fr_80px_40px] gap-2 px-4 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
                    <span class="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Start</span>
                    <span class="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">End</span>
                    <span class="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 text-right">Hours</span>
                    <span></span>
                </div>

                <!-- Rows -->
                <div class="divide-y divide-gray-100 dark:divide-gray-700/60">
                    <div
                        v-for="obj in items"
                        :key="obj.id"
                        class="grid grid-cols-[1fr_1fr_80px_40px] gap-2 px-4 py-2.5 items-center group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                        <span class="text-sm text-gray-700 dark:text-gray-300">{{ formatDate(obj.start) }}</span>
                        <span class="text-sm text-gray-700 dark:text-gray-300">{{ formatDate(obj.end) }}</span>
                        <Badge color="blue" size="xs" class="justify-self-end"><span class="tabular-nums font-medium">{{ getHours(obj) }}h</span></Badge>
                        <div class="flex justify-end">
                            <Button
                                v-if="confirmDeleteId !== obj.id"
                                variant="ghost"
                                size="sm"
                                class="!p-1 opacity-0 group-hover:opacity-100 !text-gray-300 dark:!text-gray-600 hover:!text-red-500 dark:hover:!text-red-400"
                                title="Delete"
                                @click="confirmDeleteId = obj.id"
                            >
                                <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                                </svg>
                            </Button>
                            <Button
                                v-else
                                variant="danger"
                                size="sm"
                                class="!px-1.5 !py-0.5"
                                @click="removeEntry(obj.id)"
                            >
                                Delete?
                            </Button>
                        </div>
                    </div>
                </div>

                <!-- Empty -->
                <div v-if="!items.length" class="px-4 py-4 text-center text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700">
                    No entries
                </div>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
.expand-enter-active, .expand-leave-active {
    transition: all 0.15s ease;
    overflow: hidden;
}
.expand-enter-from, .expand-leave-to {
    opacity: 0;
}
</style>
