<script lang="ts">
import { watch } from "vue";
import { useRoute, useRouter } from "vue-router";
export default {
  setup() {
    const route = useRoute();
    const router = useRouter();
    watch(
      () => route.name,
      () => {
        if (route.name === "invoices") {
          router.push({
            name: "invoices.index",
          });
        }
      },
      {
        immediate: true,
      }
    );
    return {};
  },
};
</script>
<template>
  <router-view></router-view>
</template>
