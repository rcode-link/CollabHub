<script setup>
import { computed, onMounted, ref, watch } from "vue";
import Button from "@/components/shared/Button.vue";
import { DateTime } from "luxon";
import { useAbility } from "@casl/vue";
import { useUserStore } from "@/store/user";

const props = defineProps({
    eventId: { required: true },
});

const { can } = useAbility();
const userStore = useUserStore();

const event = ref({
    creator: {
        name: "",
        avatar: "",
    },
});

const remainingDays = ref(null);

const loadEvent = () => {
    axios
        .get(`/api/v1/event/${props.eventId}`)
        .then((res) => {
            event.value = res.data.data;
            if (event.value.vacation_group_id && event.value.creator?.id) {
                loadRemainingDays(event.value.creator.id);
            }
        });
};

onMounted(loadEvent);
watch(() => props.eventId, loadEvent);

const loadRemainingDays = (userId) => {
    axios.get(`/api/v1/vacation/user-stats/${userId}`).then((res) => {
        const stats = res.data.data?.stats;
        if (stats) {
            const match = stats.find(
                (s) => s.group.id === event.value.vacation_group_id
            );
            if (match) {
                remainingDays.value = match.remaining;
            }
        }
    }).catch(() => {});
};

const response = (status) => {
    axios.put(`/api/v1/vacation/${props.eventId}`, {
        status,
    });
};

const endDays = computed(() => {
    return event.value.freq_until
        ? DateTime.fromISO(event.value.freq_until)
        : DateTime.fromISO(event.value.start_time);
});

const totalDays = computed(() => {
    return Math.floor(
        endDays.value
            .diff(DateTime.fromISO(event.value.start_time), ["days"])
            .toObject().days
    ).toFixed(0);
});

const canApprove = computed(() => {
    return can(`can-approve-vacation.${userStore.company?.id}`, "");
});
</script>

<template>
    <div class="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden my-2">
        <table class="w-full text-sm">
            <tbody>
                <tr class="border-b border-gray-100 dark:border-gray-800">
                    <td class="px-4 py-2 font-medium text-gray-500 dark:text-gray-400 w-40">Status</td>
                    <td class="px-4 py-2 text-right">
                        <span class="inline-flex items-center gap-1.5">
                            <template v-if="event.approved">
                                Approved
                                <span class="w-2 h-2 bg-green-600 rounded-full" />
                            </template>
                            <template v-else-if="!event.approved && event.managers?.length === 0">
                                Denied
                                <span class="w-2 h-2 bg-red-600 rounded-full" />
                            </template>
                            <template v-else>
                                Pending
                                <span class="w-2 h-2 bg-yellow-500 rounded-full" />
                            </template>
                        </span>
                    </td>
                </tr>
                <tr class="border-b border-gray-100 dark:border-gray-800">
                    <td class="px-4 py-2 font-medium text-gray-500 dark:text-gray-400">Title</td>
                    <td class="px-4 py-2">{{ event.summary }}</td>
                </tr>
                <tr v-if="event.description" class="border-b border-gray-100 dark:border-gray-800">
                    <td class="px-4 py-2 font-medium text-gray-500 dark:text-gray-400">Description</td>
                    <td class="px-4 py-2">{{ event.description }}</td>
                </tr>
                <tr v-if="event.vacation_group" class="border-b border-gray-100 dark:border-gray-800">
                    <td class="px-4 py-2 font-medium text-gray-500 dark:text-gray-400">Vacation Group</td>
                    <td class="px-4 py-2">{{ event.vacation_group.name }}</td>
                </tr>
                <tr v-if="remainingDays !== null" class="border-b border-gray-100 dark:border-gray-800">
                    <td class="px-4 py-2 font-medium text-gray-500 dark:text-gray-400">Remaining Days</td>
                    <td class="px-4 py-2">
                        <span :class="remainingDays > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'" class="font-semibold">
                            {{ remainingDays }}
                        </span>
                    </td>
                </tr>
                <tr class="border-b border-gray-100 dark:border-gray-800">
                    <td class="px-4 py-2 font-medium text-gray-500 dark:text-gray-400">Start Date</td>
                    <td class="px-4 py-2">
                        {{ DateTime.fromISO(event.start_time).toLocaleString(DateTime.DATE_SHORT) }}
                    </td>
                </tr>
                <tr class="border-b border-gray-100 dark:border-gray-800">
                    <td class="px-4 py-2 font-medium text-gray-500 dark:text-gray-400">End Date</td>
                    <td class="px-4 py-2">
                        {{ endDays.toLocaleString(DateTime.DATE_SHORT) }}
                    </td>
                </tr>
                <tr class="border-b border-gray-100 dark:border-gray-800">
                    <td class="px-4 py-2 font-medium text-gray-500 dark:text-gray-400">Total Days</td>
                    <td class="px-4 py-2">{{ totalDays }}</td>
                </tr>
                <tr class="border-b border-gray-100 dark:border-gray-800">
                    <td class="px-4 py-2 font-medium text-gray-500 dark:text-gray-400">Start Time</td>
                    <td class="px-4 py-2">
                        {{ DateTime.fromISO(event.start_time).toLocaleString(DateTime.TIME_24_SIMPLE) }}
                    </td>
                </tr>
                <tr>
                    <td class="px-4 py-2 font-medium text-gray-500 dark:text-gray-400">End Time</td>
                    <td class="px-4 py-2">
                        {{ DateTime.fromISO(event.end_time).toLocaleString(DateTime.TIME_24_SIMPLE) }}
                    </td>
                </tr>
            </tbody>
        </table>

        <div v-if="canApprove" class="px-4 py-3 flex gap-2 border-t border-gray-100 dark:border-gray-800">
            <Button @click="() => response('accept')">Approve</Button>
            <Button variant="danger" @click="() => response('decline')">Decline</Button>
        </div>
    </div>
</template>
