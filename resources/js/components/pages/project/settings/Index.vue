<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAbility } from "@casl/vue";
import { useBreadcrumbStore } from "@/store/breadcrumb";
import ItemTypes from "./ItemTypes.vue";
import RelationTypes from "./RelationTypes.vue";
import UserIcon from "@/components/shared/UserIcon.vue";
import Button from "@/components/shared/Button.vue";

const route = useRoute();
const router = useRouter();
const breadcrumbStore = useBreadcrumbStore();
const { can } = useAbility();

// ── Users ──
const users = ref([]);
const loadUsers = () => {
    window.axios.get(`/api/v1/users/project`, {
        params: { project_id: route.params.project },
    }).then((res) => {
        users.value = res.data.data ?? res.data ?? [];
    }).catch(() => {});
};

// ── Danger Zone ──
const confirmingDelete = ref(false);
const deleting = ref(false);

const deleteProject = () => {
    if (!confirmingDelete.value) {
        confirmingDelete.value = true;
        setTimeout(() => { confirmingDelete.value = false; }, 4000);
        return;
    }
    deleting.value = true;
    window.axios.delete(`/api/v1/projects/${route.params.project}`).then(() => {
        router.push({ name: "home" });
    }).finally(() => { deleting.value = false; });
};

loadUsers();

onMounted(() => {
    breadcrumbStore.addEntry([{ title: "Settings" }]);
});

onBeforeUnmount(() => {
    breadcrumbStore.addEntry([]);
});
</script>

<template>
    <div class="max-w-2xl space-y-4">

        <!-- Users card -->
        <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
            <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <div>
                    <h2 class="text-sm font-semibold text-gray-900 dark:text-white">Users</h2>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Members with access to this project</p>
                </div>
                <span class="text-xs text-gray-400 dark:text-gray-500 tabular-nums">{{ users.length }} members</span>
            </div>

            <ul class="divide-y divide-gray-100 dark:divide-gray-700/60">
                <li
                    v-for="user in users"
                    :key="user.id"
                    class="flex items-center gap-3 px-5 py-3"
                >
                    <UserIcon :user="user" class="flex-shrink-0" />
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ user.name }}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ user.email }}</p>
                    </div>
                </li>
            </ul>

            <div v-if="!users.length" class="px-5 py-6 text-center">
                <p class="text-sm text-gray-400 dark:text-gray-500">No members found</p>
            </div>
        </div>

        <!-- Item Types card -->
        <ItemTypes />

        <!-- Relation Types card -->
        <RelationTypes />

        <!-- Danger Zone card -->
        <div
            v-if="can(`can-delete-project.${route.params.project}`)"
            class="rounded-xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-gray-800 shadow-sm overflow-hidden"
        >
            <div class="flex items-center justify-between px-5 py-4 border-b border-red-100 dark:border-red-900/30">
                <div>
                    <h2 class="text-sm font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Irreversible actions for this project</p>
                </div>
            </div>

            <div class="px-5 py-4 flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">Delete this project</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Once deleted, this cannot be undone.</p>
                </div>
                <button
                    @click="deleteProject"
                    :disabled="deleting"
                    class="flex-shrink-0 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors"
                    :class="confirmingDelete
                        ? 'bg-red-600 text-white border-red-600 hover:bg-red-700'
                        : 'text-red-600 dark:text-red-400 border-red-300 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20'"
                >
                    <svg v-if="deleting" class="w-3.5 h-3.5 animate-spin inline mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 12a9 9 0 11-6.219-8.56"/>
                    </svg>
                    {{ confirmingDelete ? 'Click again to confirm' : 'Delete project' }}
                </button>
            </div>
        </div>

    </div>
</template>
