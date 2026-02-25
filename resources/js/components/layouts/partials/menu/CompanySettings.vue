<script setup lang="js">
import { useAbility } from "@casl/vue";
import { useUserStore } from "@/store/user";

const { can } = useAbility();
const userStore = useUserStore();
</script>
<template>
    <div>
        <h4
            class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-3 mb-2"
        >
            Company
        </h4>
        <nav class="space-y-0.5">
            <router-link
                :to="{ name: 'settings.company' }"
                class="sidebar-nav-link"
            >
                Name & Logo
            </router-link>
            <router-link
                v-if="can(`can-view-users.${userStore.company.id}`, '')"
                :to="{ name: 'settings.company-info' }"
                class="sidebar-nav-link"
            >
                Billing information
            </router-link>
            <router-link
                :to="{ name: 'settings.users' }"
                class="sidebar-nav-link"
            >
                Users{{
                    can(`can-update-company.${userStore.company.id}`, "")
                        ? " settings"
                        : ""
                }}
            </router-link>
        </nav>
    </div>
</template>
