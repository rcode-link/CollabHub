<script setup lang="js">
import { ref, watch } from "vue";

const props = defineProps({ modelValue: { default: () => [] } });
const emit = defineEmits(["update:modelValue"]);

const tags = ref(Array.isArray(props.modelValue) ? [...props.modelValue] : []);
const input = ref("");

watch(() => props.modelValue, (v) => { tags.value = Array.isArray(v) ? [...v] : []; });

const addTag = () => {
    const val = input.value.trim();
    if (val && !tags.value.includes(val)) {
        tags.value.push(val);
        input.value = "";
        emit("update:modelValue", tags.value);
    }
};

const removeTag = (index) => {
    tags.value.splice(index, 1);
    emit("update:modelValue", tags.value);
};
</script>

<template>
    <div class="space-y-2">
        <input
            v-model="input"
            type="text"
            placeholder="Type a tag and press Enter…"
            @keydown.enter.prevent="addTag"
            class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <div v-if="tags.length" class="flex flex-wrap gap-1.5">
            <span
                v-for="(tag, index) in tags"
                :key="index + tag"
                class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            >
                {{ tag }}
                <button
                    type="button"
                    @click="() => removeTag(index)"
                    class="hover:text-blue-900 dark:hover:text-blue-200 flex-shrink-0"
                >
                    <svg class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </button>
            </span>
        </div>
    </div>
</template>
