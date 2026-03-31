<script setup>
import { ref } from "vue";
import { useRoute } from "vue-router";
import Button from "@/components/shared/Button.vue";

const route = useRoute();

const relations = ref([]);
const addRelationName = ref("");
const addRelationDirection = ref("child");
const addingRelation = ref(false);
const savingRelationId = ref(null);
const deletingRelationId = ref(null);

const loadRelations = () => {
    window.axios.get(`/api/v1/task/relations`).then((res) => {
        relations.value = (res.data.data || res.data).filter(
            (r) => String(r.project_id) === String(route.params.project)
        );
    });
};

const createRelation = () => {
    if (!addRelationName.value.trim()) return;
    addingRelation.value = true;
    window.axios.post(`/api/v1/task/relations`, {
        name: addRelationName.value,
        direction: addRelationDirection.value,
        project_id: route.params.project,
    }).then(() => {
        loadRelations();
        addRelationName.value = "";
        addRelationDirection.value = "child";
    }).finally(() => { addingRelation.value = false; });
};

const updateRelation = (item) => {
    savingRelationId.value = item.id;
    window.axios.put(`/api/v1/task/relations/${item.id}`, {
        name: item.name,
        direction: item.direction,
        can_parent_be_closed: item.can_parent_be_closed,
    }).finally(() => { savingRelationId.value = null; });
};

const deleteRelation = (item) => {
    if (deletingRelationId.value === item.id) {
        window.axios.delete(`/api/v1/task/relations/${item.id}`).then(() => {
            loadRelations();
            deletingRelationId.value = null;
        });
    } else {
        deletingRelationId.value = item.id;
        setTimeout(() => {
            if (deletingRelationId.value === item.id) deletingRelationId.value = null;
        }, 3000);
    }
};

loadRelations();
</script>

<template>
    <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <div>
                <h2 class="text-sm font-semibold text-gray-900 dark:text-white">Relation Types</h2>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Define how tasks relate to each other</p>
            </div>
            <span class="text-xs text-gray-400 dark:text-gray-500 tabular-nums">{{ relations.length }} relations</span>
        </div>

        <ul class="divide-y divide-gray-100 dark:divide-gray-700/60">
            <li
                v-for="item in relations"
                :key="item.id"
                class="flex items-center gap-3 px-5 py-3 group"
            >
                <!-- Direction -->
                <select
                    v-model="item.direction"
                    @change="updateRelation(item)"
                    class="flex-shrink-0 rounded-lg border border-transparent bg-transparent px-2 py-1 text-xs font-medium hover:border-gray-200 dark:hover:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                    :class="item.direction === 'parent' ? 'text-blue-500' : 'text-orange-500'"
                >
                    <option value="parent">Parent</option>
                    <option value="child">Child</option>
                </select>

                <!-- Name -->
                <input
                    v-model="item.name"
                    class="flex-1 text-sm text-gray-900 dark:text-white bg-transparent border border-transparent rounded-lg px-2 py-1 hover:border-gray-200 dark:hover:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                    @keyup.enter="updateRelation(item)"
                    @blur="updateRelation(item)"
                />

                <!-- Can close parent toggle -->
                <label class="flex items-center gap-2 cursor-pointer flex-shrink-0">
                    <div class="relative">
                        <input
                            type="checkbox"
                            class="sr-only"
                            :checked="item.can_parent_be_closed"
                            @change="() => { item.can_parent_be_closed = !item.can_parent_be_closed; updateRelation(item); }"
                        />
                        <div
                            class="w-8 h-4 rounded-full transition-colors"
                            :class="item.can_parent_be_closed ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'"
                        ></div>
                        <div
                            class="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform"
                            :class="item.can_parent_be_closed ? 'translate-x-4' : 'translate-x-0'"
                        ></div>
                    </div>
                    <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Can close parent</span>
                </label>

                <!-- Saving spinner -->
                <div v-if="savingRelationId === item.id" class="flex-shrink-0">
                    <svg class="w-3.5 h-3.5 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 12a9 9 0 11-6.219-8.56"/>
                    </svg>
                </div>

                <!-- Delete -->
                <button
                    @click="deleteRelation(item)"
                    class="flex-shrink-0 p-1 rounded transition-colors"
                    :class="deletingRelationId === item.id
                        ? 'text-red-500 dark:text-red-400'
                        : 'text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 hover:text-red-500 dark:hover:text-red-400'"
                >
                    <svg v-if="deletingRelationId !== item.id" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                    <span v-else class="text-xs font-medium">Confirm?</span>
                </button>
            </li>
        </ul>

        <!-- Add new relation -->
        <div class="flex items-center gap-2 px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
            <select
                v-model="addRelationDirection"
                class="flex-shrink-0 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-xs font-medium text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
                <option value="parent">Parent</option>
                <option value="child">Child</option>
            </select>
            <input
                v-model="addRelationName"
                type="text"
                placeholder="New relation type..."
                class="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                @keyup.enter="createRelation"
            />
            <Button size="sm" :disabled="!addRelationName.trim() || addingRelation" @click="createRelation">
                <svg v-if="addingRelation" class="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                Add
            </Button>
        </div>
    </div>
</template>
