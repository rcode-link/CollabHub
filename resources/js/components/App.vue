<template>
    <div id="print" class="tiptap ProseMirror printOnly"></div>
    <router-view></router-view>
    <div id="append-container"></div>
</template>
<script setup lang="js">
import { onMounted } from "vue";
import useInit from "../functions/useInit";

onMounted(() => {
    useInit();
});
</script>

<style>
@media print {
    .printOnly {
        display: block;
    }
}

@media screen {
    .printOnly {
        display: none;
    }
}
</style>
