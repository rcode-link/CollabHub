<script setup lang="ts">
import { useAbility } from "@casl/vue";
import { useUserStore } from "../../../../store/user";
import { FwbListGroup, FwbListGroupItem, FwbHeading } from "flowbite-vue";

const { can } = useAbility();
const userStore = useUserStore();
</script>
<template>
    <FwbHeading tag="h4">Company</FwbHeading>
    <fwb-list-group class="w-full mb-4">
        <FwbListGroupItem>
            <router-link :to="{ name: 'settings.company' }"
                >Name & Logo
            </router-link>
        </FwbListGroupItem>
        <fwb-list-group-item
            v-if="can(`can-view-users.${userStore.company.id}`, '')"
        >
            <router-link :to="{ name: 'settings.company-info' }">
                Billing information
            </router-link>
        </fwb-list-group-item>
        <FwbListGroupItem>
            <router-link :to="{ name: 'settings.users' }"
                >Users
                {{
                    can(`can-update-company.${userStore.company.id}`, "")
                        ? "settings"
                        : ""
                }}
            </router-link>
        </FwbListGroupItem>
    </fwb-list-group>
</template>
