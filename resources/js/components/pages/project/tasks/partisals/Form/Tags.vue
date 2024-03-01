<script setup lang="js">
import { ref, watch } from "vue";
import Text from "../../../../../shared/Text.vue";
import { FwbBadge } from "flowbite-vue";
const props = defineProps({
  modelValue: []
});
const emit = defineEmits(['update:modelValue']);

watch(
  () => props.modelValue,
  () => {
    tags.value = props.modelValue;
  }
);

const tags = ref(props.modelValue);
const addTags = (e) => {
  const target = e.target;
  if (tags.value.indexOf(target.value) === -1) {
    tags.value.push(target.value);
    target.value = "";
    emit("update:modelValue", tags.value);
  }
};

const removeTag = (index) => {
  tags.value.splice(index, 1);
  emit("update:modelValue", tags.value);
};
</script>
<template>
    <Text @keydown.enter.prevent="addTags" />
    <div class="flex gap-1 mt-2 flex-wrap">
        <fwb-badge v-for="(str, index) in tags" :key="index + str"
            >{{ str }}
            <span @click="() => removeTag(index)" class="ml-2 cursor-pointer"
                >x</span
            >
        </fwb-badge>
    </div>
</template>
