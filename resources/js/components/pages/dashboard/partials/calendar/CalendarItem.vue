<template>
    <div @click="open" class="calendar-item-container cursor-pointer" :class="badgeClass">
        <div class="calendar-item-time">
            {{ DateTime.fromISO(obj.start_time).toFormat('HH:mm') }}
        </div>
        <div class="calendar-item-content">
            <div class="calendar-item-title">
                <span v-if="myStatus()" class="mr-1">✓</span>
                {{ obj.summary }}
            </div>
            <div v-if="obj.description" class="calendar-item-description">
                {{ truncateDescription(obj.description) }}
            </div>
        </div>
    </div>
</template>
<script setup lang="js">
import { find } from "lodash";
import { DateTime } from "luxon";
import { useUserStore } from "@/store/user";
import { computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const userStore = useUserStore();
const props = defineProps(['obj']);

const badgeClass = computed(() => {
    if (props.obj.type === "event" && props.obj.user_id !== userStore.user.id) {
        return "calendar-item-default";
    }

    if (props.obj.type === "event") {
        return "calendar-item-green";
    }

    if (props.obj.approved) {
        return "calendar-item-purple";
    }

    return "calendar-item-red";
});

const open = () => {
    router.push({
        query: {
            event: props.obj.id,
        },
    });
};

const myStatus = () => {
    const me = find(props.obj.attendance, { id: userStore.user.id });
    return me?.attending;
};

const truncateDescription = (description) => {
    if (!description) return '';
    return description.length > 30 ? description.substring(0, 30) + '...' : description;
};
</script>
<style scoped>
.calendar-item-container {
    @apply flex w-full rounded-lg px-2 py-1 mb-1;
}

.calendar-item-green {
    @apply bg-green-100 dark:bg-green-900;
}

.calendar-item-purple {
    @apply bg-purple-100 dark:bg-purple-900;
}

.calendar-item-red {
    @apply bg-red-100 dark:bg-red-900;
}

.calendar-item-default {
    @apply bg-gray-100 dark:bg-gray-700;
}

.calendar-item-time {
    @apply text-xs font-medium min-w-12 text-gray-600 dark:text-gray-300;
}

.calendar-item-content {
    @apply ml-2 flex-1 overflow-hidden;
}

.calendar-item-title {
    @apply text-sm font-medium truncate;
}

.calendar-item-description {
    @apply text-xs text-gray-500 dark:text-gray-400 truncate;
}
</style>
