<script setup lang="ts">
import { useBreadcrumbStore } from "../../store/breadcrumb";
import { FwbBreadcrumb } from "flowbite-vue";
import HomeIcon from "../shared/icons/HomeIcon.vue";

const store = useBreadcrumbStore();
</script>
<template>
    <fwb-breadcrumb
        v-if="store.getLinks.length"
        solid
        class="space-x-1 md:space-x-1"
    >
        <template v-for="(obj, index) in store.getLinks" :key="index">
            <router-link to="/">
                <HomeIcon v-if="index === 0" class="w-5 h-5" />
            </router-link>
            <svg
                v-if="index > 0"
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

            <router-link
                v-if="index < store.getLinks.length - 1"
                :to="obj.link"
                class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
            >
                {{ obj.title }}
            </router-link>

            <div
                v-else
                class="text-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400 inline-flex items-center"
            >
                {{ obj.title }}
            </div>
        </template>
    </fwb-breadcrumb>
    <div v-else class="mb-4"></div>
</template>
