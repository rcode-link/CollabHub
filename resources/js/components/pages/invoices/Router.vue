<script lang="js">
import { watch, onUnmounted } from "vue";
import { useBreadcrumbStore } from "@/store/breadcrumb";
import { useRoute, useRouter } from "vue-router";
const breadcrumb = useBreadcrumbStore();
export default {
    setup() {
        const route = useRoute();
        const router = useRouter();
        watch(
            () => route.name,
            () => {
                breadcrumb.addEntry([]);
                if (route.name === "invoices") {
                    router.push({
                        name: "invoices.index",
                    });
                }
            },
            {
                immediate: true,
            },
        );
        return {};
    },
};
onUnmounted(() => {
    //breadcrumb.addEntery([]);
});
</script>
<template>
    <router-view></router-view>
</template>
