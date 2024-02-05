<script setup lang="ts">
import { useAbility } from "@casl/vue";
import { useUserStore } from "../../../../store/user";

import { FwbListGroup, FwbListGroupItem, FwbHeading } from "flowbite-vue";

const { can } = useAbility();
const userStore = useUserStore();
</script>
<template>
    <FwbHeading tag="h4">Invoice</FwbHeading>
    <fwb-list-group class="w-full mb-4">
        <fwb-list-group-item
            v-if="can(`can-view-users.${userStore.company.id}`, '')"
        >
            <router-link :to="{ name: 'settings.invoice-items' }">
                Billable items
            </router-link>
        </fwb-list-group-item>
        <fwb-list-group-item
            v-if="can(`can-view-users.${userStore.company.id}`, '')"
        >
            <router-link :to="{ name: 'settings.notes' }"> Notes </router-link>
        </fwb-list-group-item>
        <fwb-list-group-item
            v-if="can(`can-view-users.${userStore.company.id}`, '')"
        >
            <router-link :to="{ name: 'settings.mesurment-units' }">
                Masurment units
            </router-link>
        </fwb-list-group-item>
        <fwb-list-group-item
            v-if="can(`can-view-users.${userStore.company.id}`, '')"
        >
            <router-link :to="{ name: 'settings.currency' }">
                Currency
            </router-link>
        </fwb-list-group-item>
    </fwb-list-group>
</template>
