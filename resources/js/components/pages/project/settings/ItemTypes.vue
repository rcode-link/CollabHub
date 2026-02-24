<script setup>
import { ref } from "vue";
import Button from "@/components/shared/Button.vue";

const itemTypes = ref([]);
const addTypeName = ref("");
const addTypeColour = ref("#6B7280");
const addingType = ref(false);
const savingTypeId = ref(null);
const deletingTypeId = ref(null);

const loadItemTypes = () => {
    window.axios.get(`/api/v1/task-types`).then((res) => {
        itemTypes.value = res.data;
    });
};

const createItemType = () => {
    if (!addTypeName.value.trim()) return;
    addingType.value = true;
    window.axios.post(`/api/v1/task-types`, {
        title: addTypeName.value,
        colour: addTypeColour.value,
    }).then(() => {
        loadItemTypes();
        addTypeName.value = "";
        addTypeColour.value = "#6B7280";
    }).finally(() => { addingType.value = false; });
};

const updateItemType = (item) => {
    savingTypeId.value = item.id;
    window.axios.put(`/api/v1/task-types/${item.id}`, {
        title: item.title,
        colour: item.colour,
    }).finally(() => { savingTypeId.value = null; });
};

const deleteItemType = (item) => {
    if (deletingTypeId.value === item.id) {
        window.axios.delete(`/api/v1/task-types/${item.id}`).then(() => {
            loadItemTypes();
            deletingTypeId.value = null;
        });
    } else {
        deletingTypeId.value = item.id;
        setTimeout(() => {
            if (deletingTypeId.value === item.id) deletingTypeId.value = null;
        }, 3000);
    }
};

loadItemTypes();
</script>

<template>
    <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <div>
                <h2 class="text-sm font-semibold text-gray-900 dark:text-white">Item Types</h2>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Task types like Bug, Feature, User Story</p>
            </div>
            <span class="text-xs text-gray-400 dark:text-gray-500 tabular-nums">{{ itemTypes.length }} types</span>
        </div>

        <ul class="divide-y divide-gray-100 dark:divide-gray-700/60">
            <li
                v-for="item in itemTypes"
                :key="item.id"
                class="flex items-center gap-3 px-5 py-3 group"
            >
                <!-- Color dot -->
                <label class="relative flex-shrink-0 cursor-pointer group/color">
                    <div
                        class="w-4 h-4 rounded-full ring-2 ring-white dark:ring-gray-800 shadow-sm transition-transform group-hover/color:scale-110"
                        :style="{ backgroundColor: item.colour || '#6B7280' }"
                    ></div>
                    <input
                        type="color"
                        :value="item.colour || '#6B7280'"
                        class="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        @input="(e) => { item.colour = e.target.value; updateItemType(item); }"
                    />
                </label>

                <!-- Title -->
                <input
                    v-model="item.title"
                    class="flex-1 text-sm text-gray-900 dark:text-white bg-transparent border border-transparent rounded-lg px-2 py-1 hover:border-gray-200 dark:hover:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                    @keyup.enter="updateItemType(item)"
                    @blur="updateItemType(item)"
                />

                <!-- Saving spinner -->
                <div v-if="savingTypeId === item.id" class="flex-shrink-0">
                    <svg class="w-3.5 h-3.5 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 12a9 9 0 11-6.219-8.56"/>
                    </svg>
                </div>

                <!-- Delete -->
                <button
                    @click="deleteItemType(item)"
                    class="flex-shrink-0 p-1 rounded transition-colors"
                    :class="deletingTypeId === item.id
                        ? 'text-red-500 dark:text-red-400'
                        : 'text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 hover:text-red-500 dark:hover:text-red-400'"
                >
                    <svg v-if="deletingTypeId !== item.id" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                    <span v-else class="text-xs font-medium">Confirm?</span>
                </button>
            </li>
        </ul>

        <!-- Add new item type -->
        <div class="flex items-center gap-2 px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
            <label class="relative flex-shrink-0 cursor-pointer group/color">
                <div
                    class="w-5 h-5 rounded-full ring-2 ring-white dark:ring-gray-700 shadow-sm transition-transform group-hover/color:scale-110"
                    :style="{ backgroundColor: addTypeColour }"
                ></div>
                <input
                    type="color"
                    v-model="addTypeColour"
                    class="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
            </label>
            <input
                v-model="addTypeName"
                type="text"
                placeholder="New item type..."
                class="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                @keyup.enter="createItemType"
            />
            <Button size="sm" :disabled="!addTypeName.trim() || addingType" @click="createItemType">
                <svg v-if="addingType" class="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                Add
            </Button>
        </div>
    </div>
</template>
