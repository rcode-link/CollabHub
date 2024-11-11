<script lang="js" setup>
import { debounce } from "lodash";
import Text from "./Text.vue";
import { ref, watch } from "vue";

const emit = defineEmits(["search", "selected"]);
const props = defineProps(["items"]);
const showItems = ref(false);
const inputValue = ref("");
const activeItem = ref(-1);
const textInput = ref(null);

const handleItemClick = (obj) => {
    emit("selected", obj);
    showItems.value = false;
    inputValue.value = "";
};

const emitSearch = debounce((val) => emit("search", val), 300);
const handleUp = () => {
    activeItem.value = activeItem.value - 1;
    if (activeItem.value < 0) {
        activeItem.value = props.items.length - 1;
    }
};
const handleDown = () => {
    activeItem.value = activeItem.value + 1;
    if (activeItem.value >= props.items.length) {
        activeItem.value = 0;
    }
};
watch(
    () => props.items,
    () => {
        textInput.value.focus();
    },
);
</script>

<template>
    <div class="relative">
        <Text
            @focus="
                (e) => {
                    showItems = true;
                    emit('search', e.target.value);
                }
            "
            @focusout="() => (showItems = false)"
            v-model="inputValue"
            ref="textInput"
            @keydown.down.prevent="handleDown"
            @keydown.up.prevent="handleUp"
            @keydown.enter.prevent="
                () => handleItemClick(items[activeItem].value)
            "
            @update:model-value="emitSearch"
        />
        <div
            v-show="showItems"
            class="absolute w-full z-50 bg-white dark:bg-gray-700 shadow"
        >
            <div
                v-for="(obj, index) in items"
                @mousedown="() => handleItemClick(obj.value)"
                :class="{
                    'flex gap-3 items-center text-gray-900 dark:text-white w-full px-4 py-2 border-b border-gray-200 dark:border-gray-600 hover:bg-gray-200 hover:dark:bg-gray-500 cursor-pointer': true,
                    'bg-gray-200 dark:bg-gray-500': index === activeItem,
                }"
                :key="index"
            >
                {{ obj.label }}
            </div>
            <div
                v-if="!items || items.length === 0"
                class="flex gap-3 items-center text-gray-900 dark:text-white w-full px-4 py-2 border-b border-gray-200 dark:border-gray-600 hover:bg-gray-200 hover:dark:bg-gray-500 cursor-pointer"
            >
                No items found
            </div>
        </div>
    </div>
</template>

<style scoped></style>
