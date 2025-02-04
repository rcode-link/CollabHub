<script lang="js" setup>
//@ts-ignore
import Menu from "../header/Menu.vue";
//@ts-ignore
import Breadcrumb from "../header/Breadcrumb.vue";
import { FwbProgress } from "flowbite-vue";
import { useProgressBarStore } from "../../store/progressBarStore";
</script>

<template>
    <div class="text-gray-900 dark:text-white print:hidden">
        <Menu id="menu" />
        <div class="container mx-auto px-2 sm:px-0 flex flex-col gap-4">
            <Breadcrumb class="mt-2" />
            <slot></slot>
        </div>
    </div>
</template>
<style scoped></style>
