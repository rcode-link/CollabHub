<script setup lang="js">
import AddPermissionsModal from "@/components/pages/settings/role/partials/AddPermissionsModal.vue";
import Card from "@/components/shared/Card.vue";
import { useRoleStore } from "@/store/roleStore";
import { computed } from "vue";

const roleStore = useRoleStore();

const groupedPermissions = computed(() => {
    const definitions = roleStore.role?.definitions ?? [];
    const groups = {};
    for (const def of definitions) {
        const scope = def.scope ?? 'other';
        if (!groups[scope]) groups[scope] = [];
        groups[scope].push(def);
    }
    return groups;
});
</script>

<template>
    <Card>
        <div class="p-5">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-sm font-medium text-gray-900 dark:text-white">Permissions in role</h3>
                <div v-if="roleStore.role.can_be_changed">
                    <AddPermissionsModal />
                </div>
            </div>
            <div
                v-for="(obj, key) in groupedPermissions"
                :key="key"
                class="mb-4 last:mb-0"
            >
                <h4 class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                    {{ key }}
                </h4>
                <div class="space-y-1">
                    <div
                        v-for="def in obj"
                        :key="def.id"
                        class="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                        {{ def.name }}
                    </div>
                </div>
            </div>
            <div v-if="!roleStore.role?.definitions?.length" class="flex flex-col items-center justify-center py-12 text-center">
                <p class="text-sm text-gray-500 dark:text-gray-400">No permissions assigned</p>
            </div>
        </div>
    </Card>
</template>
