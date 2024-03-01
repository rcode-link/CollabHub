<script setup lang="js">
import Settings from "../../../layouts/Settings.vue";
import { FwbTab, FwbTabs } from "flowbite-vue";
import { ref } from "vue";
import List from "./partial/List.vue";
import { useUserStore } from "../../../../store/user";

import Invitetion from "./partial/Invitetion.vue";
import { useAbility } from "@casl/vue";
const { can, rules } = useAbility();

const activeTab = ref("users");
const userState = useUserStore();
</script>

<template>
    <Settings>
        <div class="w-full">
            <fwb-tabs v-model="activeTab" variant="pills" class="mt-5">
                <fwb-tab name="users" title="Users">
                    <List v-if="activeTab === 'users'" />
                </fwb-tab>
                <fwb-tab
                    v-if="can(`can-invite-users.${userState.company.id}`)"
                    name="invite"
                    title="Invite"
                >
                    <Invitetion v-if="activeTab === 'invite'" />
                </fwb-tab>
            </fwb-tabs>
        </div>
    </Settings>
</template>

<style scoped></style>
