<script lang="ts">
import Text from "./Text.vue";
import { ref, watch } from "vue";

interface iItems {
  items: {
    value: any;
    label: string;
  };
}
export default {
  components: {
    Text,
  },
  props: ["items"],
  setup({ items }: iItems, { emit }) {
    const data = ref([]);
    const showItems = ref(false);
    const timeOutRef = ref<number | undefined>();
    const inputValue = ref("");
    const activeItem = ref(-1);

    const handleItemClick = (obj: any) => {
      emit("selected", obj);
      showItems.value = false;
      inputValue.value = "";
    };

    watch(inputValue, () => {
      clearTimeout(timeOutRef.value);
      timeOutRef.value = setTimeout(() => {
        emit("search", inputValue.value);
      }, 300);
    });
    const handleUp = () => {};
    const handleDown = () => {
      activeItem.value = activeItem.value + 1;
      //@ts-ignore
      if (activeItem.value >= items.length) {
        activeItem.value = 0;
      }
    };

    watch(
      () => items,
      () => {
        console.log({ items });
      },
      { deep: true }
    );

    return {
      data,
      showItems,
      timeOutRef,
      inputValue,
      activeItem,
      items,
      handleItemClick,
      handleUp,
      handleDown,
      emit,
    };
  },
};
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
      @keydown.down="handleDown"
      @keydown.up="handleUp"
      @keydown.enter.prevent="() => handleItemClick(items[activeItem].value)"
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

<style scoped>
</style>
