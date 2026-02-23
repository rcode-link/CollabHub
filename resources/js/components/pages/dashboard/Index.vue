<template>
    <Auth title="Start page">
        <!-- Widget layout: messages + tasks (flex-1) | calendar (fixed right) -->
        <div class="flex flex-col lg:flex-row gap-4 items-start">
            <div class="flex flex-col gap-4 flex-1 w-full">
                <NewMessages />
                <Tasks />
            </div>
            <div class="w-full lg:w-1/3 flex-shrink-0">
                <CalendarEvents />
            </div>
        </div>
    </Auth>
</template>

<script setup>
import Auth from "@/components/layouts/Auth.vue";
import { useBreadcrumbStore } from "@/store/breadcrumb";
import NewMessages from "@/components/pages/dashboard/partials/NewMessages.vue";
import Tasks from "@/components/pages/dashboard/partials/Tasks.vue";
import CalendarEvents from "@/components/pages/dashboard/partials/CalendarEvents.vue";

const breadcrumb = useBreadcrumbStore();

breadcrumb.setLinks([
    {
        link: "/",
        title: "Home",
    },
]);
</script>

<style scoped></style>
