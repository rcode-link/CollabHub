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
            Invoice
        </h4>
        <nav class="space-y-0.5">
            <router-link
                v-if="can(`can-view-users.${userStore.company.id}`, '')"
                :to="{ name: 'settings.invoice-items' }"
                class="sidebar-nav-link"
            >
                Billable items
            </router-link>
            <router-link
                v-if="can(`can-view-users.${userStore.company.id}`, '')"
                :to="{ name: 'settings.notes' }"
                class="sidebar-nav-link"
            >
                Notes
            </router-link>
            <router-link
                v-if="can(`can-view-users.${userStore.company.id}`, '')"
                :to="{ name: 'settings.mesurment-units' }"
                class="sidebar-nav-link"
            >
                Measurement units
            </router-link>
            <router-link
                v-if="can(`can-view-users.${userStore.company.id}`, '')"
                :to="{ name: 'settings.currency' }"
                class="sidebar-nav-link"
            >
                Currency
            </router-link>
        </nav>
    </div>
</template>
