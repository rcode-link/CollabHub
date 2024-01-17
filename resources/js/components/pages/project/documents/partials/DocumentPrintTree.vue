<script setup>
import {useProjectDocumentsStore} from "../../../../../store/projectDocumentsStore.js";
import DocumentItem from "./DocumentItem.vue";

const documentsStore = useProjectDocumentsStore();

defineProps({
    parent_id: null
})
</script>

<template>
    <div class="" v-for="obj in documentsStore.getDocuments.filter(item => item.parent_id === parent_id)">
        <DocumentItem :obj="obj"/>
    </div>
</template>

<style scoped>

</style>
