<template>
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
