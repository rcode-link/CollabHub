<script setup lang="ts">
import { ref, watch } from "vue";
//@ts-ignore
import Text from "../../../../../shared/Text.vue";
import { FwbBadge } from "flowbite-vue";
const props = defineProps<{
  modelValue: string[];
}>();
const emit = defineEmits<{
  (e: "update:modelValue", value: string[]): void;
}>();

watch(
  () => props.modelValue,
  () => {
    tags.value = props.modelValue;
  }
);

const tags = ref<string[]>(props.modelValue);
const addTags = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (tags.value.indexOf(target.value) === -1) {
    tags.value.push(target.value);
    target.value = "";
    emit("update:modelValue", tags.value);
  }
};

const removeTag = (index: number) => {
  tags.value.splice(index, 1);
  emit("update:modelValue", tags.value);
};
</script>
<template>
  <Text @keydown.enter.prevent="addTags" />
  <div class="flex gap-1 mt-2 flex-wrap">
    <fwb-badge v-for="(str, index) in tags" :key="index + str"
      >{{ str }}
      <span @click="() => removeTag(index)" class="ml-2 cursor-pointer">x</span>
    </fwb-badge>
  </div>
</template>