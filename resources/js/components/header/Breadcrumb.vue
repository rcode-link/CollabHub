<script setup lang="js">
import { watch } from 'vue'
import { useBreadcrumbStore } from "@/store/breadcrumb";
import { FwbBreadcrumb } from "flowbite-vue";
import HomeIcon from "@/components/shared/icons/HomeIcon.vue";

const store = useBreadcrumbStore();

watch(() => store.getLinks, () => {
    document.title = store.getLinks[store.getLinks.length - 1].title + ' - CollabHub';
})
</script>

<template>
    <fwb-breadcrumb v-if="store.getLinks.length" solid class="space-x-1">
        <!-- Home icon always links to / -->
        <router-link
            to="/"
            class="inline-flex items-center text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
        >
            <HomeIcon class="w-5 h-5" />
        </router-link>

        <!-- Remaining crumbs (skip the first "Home" entry since icon covers it) -->
        <template v-for="(obj, index) in store.getLinks.slice(1)" :key="index">
            <svg
                class="w-3 h-3 mx-1 text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
            >
                <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m1 9 4-4-4-4"
                />
            </svg>

            <!-- Clickable link (not the last crumb) -->
            <router-link
                v-if="index < store.getLinks.slice(1).length - 1"
                :to="obj.link"
                class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
            >
                {{ obj.title }}
            </router-link>

            <!-- Current page (last crumb, no link) -->
            <span
                v-else
                class="text-sm font-medium text-gray-500 dark:text-gray-400"
            >
                {{ obj.title }}
            </span>
        </template>
    </fwb-breadcrumb>
    <div v-else class="mb-4"></div>
</template>
