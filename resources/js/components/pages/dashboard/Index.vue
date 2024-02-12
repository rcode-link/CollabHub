<template>
    <Auth title="Start page">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <NewMessages />
            </div>
            <div>
                <Tasks />
            </div>
            <div class="calendar-events">
                <CalendarEvents />
            </div>
        </div>
    </Auth>
</template>
<script setup>
import Auth from "../../layouts/Auth.vue";
import { useBreadcrumbStore } from "@/store/breadcrumb";
import NewMessages from "./partials/NewMessages.vue";
import Tasks from "./partials/Tasks.vue";
import CalendarEvents from "./partials/CalendarEvents.vue";
import CalendarDetails from "./partials/calendar/Details.vue";

const breadcrumb = useBreadcrumbStore();

breadcrumb.setLinks([
    {
        link: "/",
        title: "Home",
    },
]);
</script>
<style scoped>
.calendar-events {
    grid-column-start: 1;
    grid-column-end: 3;
}
@media (max-width: 680px) {
    .calendar-events {
        grid-column-start: 1;
        grid-column-end: 2;
    }
}
</style>
