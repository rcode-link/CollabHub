<script setup>
import Card from "../../shared/Card.vue";
import { useBreadcrumbStore } from "../../../store/breadcrumb";
import { watch } from "vue";
import { useRoute } from "vue-router";
const breadcrumbStore = useBreadcrumbStore();
const route = useRoute();

watch(
    () => route.params,
    () => {
        breadcrumbStore.addEntry([
            {
                title: "Dashboard",
            },
        ]);
    },
    {
        immediate: true,
    }
);
</script>

<template>
    <Card> Dashboard </Card>
</template>

<style scoped></style>
