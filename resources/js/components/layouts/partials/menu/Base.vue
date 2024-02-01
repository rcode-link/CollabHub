<script setup lang="ts">
import { useAbility } from "@casl/vue";
import { useUserStore } from "../../../../store/user";
import { useRoleStore } from "../../../../store/roleStore";
import { FwbListGroup, FwbListGroupItem, FwbHeading } from "flowbite-vue";
const { can } = useAbility();
const roleStore = useRoleStore();
const userStore = useUserStore();
</script>
<template>
    <FwbHeading tag="h4">Basic</FwbHeading>
    <FwbListGroup class="w-full mb-4">
        <FwbListGroupItem>
            <router-link :to="{ name: 'settings.base' }"
                >My profile</router-link
            >
        </FwbListGroupItem>
        <FwbListGroupItem>
            <router-link :to="{ name: 'settings.company' }"
                >Company
                {{
                    can(`can-update-company.${userStore.company.id}`, "")
                        ? "settings"
                        : ""
                }}
            </router-link>
        </FwbListGroupItem>
    </FwbListGroup>
</template>
