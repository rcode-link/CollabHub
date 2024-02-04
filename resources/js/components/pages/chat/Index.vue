<script setup>
import Auth from "../../layouts/Auth.vue";
import { useBreadcrumbStore } from "../../../store/breadcrumb";
import Card from "../../shared/Card.vue";
import { ref, watch } from "vue";
import Users from "./partials/LeftChatManu.vue";
import MenuIcon from "../../shared/icons/MenuIcon.vue";
import { FwbButton } from "flowbite-vue";
import { useRoute } from "vue-router";

const route = useRoute();
const container = ref(null);
const showListInMobile = ref(false);
const breadcrumb = useBreadcrumbStore();
breadcrumb.setLinks([
    {
        link: "/",
        title: "Home",
    },
    {
        title: "Chat",
    },
]);

watch(
    () => route.params.chatId,
    (value, oldValue, onCleanup) => {
        showListInMobile.value = false;
    }
);
</script>

<template>
    <Auth>
        <div class="grid lg:grid-cols-3 grid-cols-1 gap-2 h-[75vh] relative">
            <fwb-button
                class="ml-auto lg:hidden h-8"
                @click="() => (showListInMobile = !showListInMobile)"
            >
                <MenuIcon class="w-4 h-4" />
            </fwb-button>
            <div
                :class="`absolute lg:relative top-[45px] lg:top-0 z-20 bg-white lg:bg-transparent w-full lg:w-auto transition-all translate-x-[-200%] lg:translate-x-0 lg:overflow-auto list ${
                    showListInMobile === true ? 'active' : ''
                }`"
            >
                <Users />
            </div>
            <Card class="flex-col col-span-3 lg:col-span-2 gap-6 relative">
                <router-view></router-view>
            </Card>
        </div>
    </Auth>
</template>

<style scoped>
.active {
    transform: translateX(0%);
}
</style>
