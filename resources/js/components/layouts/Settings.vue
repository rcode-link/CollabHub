<script setup lang="ts">
import Auth from "./Auth.vue";

import { useRoleStore } from "../../store/roleStore";
import { onMounted } from "vue";
import Base from "./partials/menu/Base.vue";
import Roles from "./partials/menu/Roles.vue";
import Invoice from "./partials/menu/Invoice.vue";
import CompanySettings from "./partials/menu/CompanySettings.vue";

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
