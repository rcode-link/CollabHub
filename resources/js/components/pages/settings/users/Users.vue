<script setup lang="js">
import Settings from "@/components/layouts/Settings.vue";
import { ref } from "vue";
import List from "@/components/pages/settings/users/partial/List.vue";
import { useUserStore } from "@/store/user";

import Invitetion from "@/components/pages/settings/users/partial/Invitetion.vue";
import { useAbility } from "@casl/vue";
const { can } = useAbility();

const activeTab = ref("users");
const userState = useUserStore();

const tabs = [
    { key: "users", label: "Users" },
];

const inviteTab = { key: "invite", label: "Invite" };
</script>

<template>
    <Settings>
        <div class="w-full">
            <div class="flex gap-1 border-b border-gray-200 dark:border-gray-700 mb-5">
                <button
                    v-for="tab in tabs"
                    :key="tab.key"
                    @click="activeTab = tab.key"
                    class="px-4 py-2 text-sm font-medium rounded-t-lg transition-colors -mb-px border-b-2"
                    :class="
                        activeTab === tab.key
                            ? 'border-blue-600 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    "
                >
                    {{ tab.label }}
                </button>
                <button
                    v-if="can(`can-invite-users.${userState.company.id}`)"
                    @click="activeTab = inviteTab.key"
                    class="px-4 py-2 text-sm font-medium rounded-t-lg transition-colors -mb-px border-b-2"
                    :class="
                        activeTab === inviteTab.key
                            ? 'border-blue-600 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    "
                >
                    {{ inviteTab.label }}
                </button>
            </div>
            <List v-if="activeTab === 'users'" />
            <Invitetion v-if="activeTab === 'invite'" />
        </div>
    </Settings>
</template>
