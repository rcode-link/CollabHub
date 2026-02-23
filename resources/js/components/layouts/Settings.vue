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
        <div class="flex flex-col md:flex-row gap-4">
            <div class="md:sticky sticky-top min-w-full md:min-w-[300px] mb-4">
                <Base />
                <CompanySettings />
                <Invoice />
                <Roles />
            </div>
            <div class="w-full" id="settingsContent">
                <slot></slot>
            </div>
        </div>
    </Auth>
</template>
