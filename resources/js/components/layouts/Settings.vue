<script setup lang="js">
import Auth from "@/components/layouts/Auth.vue";

import { useRoleStore } from "@/store/roleStore";
import { onMounted } from "vue";
import Base from "@/components/layouts/partials/menu/Base.vue";
import Roles from "@/components/layouts/partials/menu/Roles.vue";
import Invoice from "@/components/layouts/partials/menu/Invoice.vue";
import CompanySettings from "@/components/layouts/partials/menu/CompanySettings.vue";

const roleStore = useRoleStore();

onMounted(() => {
    roleStore.loadRoles();
});
</script>

<template>
    <Auth>
        <div class="mb-6">
            <h1
                class="text-2xl font-bold text-gray-900 dark:text-white"
            >
                Settings
            </h1>
        </div>
        <div class="flex flex-col lg:flex-row gap-6">
            <aside
                class="w-full lg:w-64 lg:min-w-[256px] shrink-0 lg:sticky lg:top-4 lg:self-start"
            >
                <nav class="space-y-5">
                    <Base />
                    <CompanySettings />
                    <Invoice />
                    <Roles />
                </nav>
            </aside>
            <div class="flex-1 min-w-0 max-w-2xl">
                <slot></slot>
            </div>
        </div>
    </Auth>
</template>
