<script setup>

import Card from "../../../shared/Card.vue";
import DocumentsHeader from "./partials/DocumentsHeader.vue";
import {useProjectDocumentsStore} from "../../../../store/projectDocumentsStore.js";
import DocumentPrintTree from "./partials/DocumentPrintTree.vue";
import {useBreadcrumbStore} from "../../../../store/breadcrumb.js";
import {useRoute} from "vue-router";
import {onMounted} from "vue";

const documentsStore = useProjectDocumentsStore();
const breadcrumbStore = useBreadcrumbStore();
const route = useRoute();

breadcrumbStore.addEntry([
{
    title: 'Documents'
  }
])

onMounted(() => {
  documentsStore.loadDocuments();
})
</script>

<template>
    <Card class="flex-col">
        <DocumentsHeader/>
    </Card>

    <DocumentPrintTree :parent_id="null"/>
</template>

<style scoped>

</style>
