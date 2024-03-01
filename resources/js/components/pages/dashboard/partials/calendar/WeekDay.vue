<script setup lang="js">
import CalendarItem from "./CalendarItem.vue";
defineProps({
        day: {
            type: String,
        },

        isToday:{
            type: Boolean
        },
        events: {
                type: Array
        }
    })
</script>

<template>
    <div class="calendar-card">
        <div
            :class="`sticky top-0 z-10  ${
                isToday
                    ? 'bg-gray-300 dark:bg-gray-500'
                    : 'bg-gray-100 dark:bg-gray-700'
            } flex justify-between items-center px-2`"
        >
            {{ day }}
        </div>
        <div :class="`flex flex-col gap-2 px-2`">
            <template
                v-for="obj in events.sort(function (a, b) {
                    return (
                        new Date(b.start_time).getTime() -
                        new Date(a.start_time).getTime()
                    );
                })"
                :key="obj.id"
            >
                <CalendarItem :obj="obj" />
            </template>
        </div>
    </div>
</template>

<style scoped>
.calendar-card {
    @apply border aspect-video hover:bg-gray-50 dark:hover:bg-gray-700 flex flex-col overflow-auto;
}

.calendar-card > button {
    @apply opacity-0;
}

.calendar-card:hover > button {
    @apply opacity-100;
}
</style>
