<script lang="js" setup>
import { onMounted, ref, computed } from "vue";
import { useErrorsStore } from "@/store/errors";

const errors = useErrorsStore();
const props = defineProps({
    modelValue: "",
    name: "",
    form: "",
    disabled: false,
    placeholder: { type: String, default: '' },
    type: { type: String, default: 'text' },
})
defineEmits(["update:modelValue"]);

const input = ref(null);
const hasError = computed(() => Object.prototype.hasOwnProperty.call(errors.errors, props.name));

onMounted(() => {
    if (input.value?.hasAttribute("autofocus")) {
        input.value?.focus();
    }
});

defineExpose({ focus: () => input.value?.focus() });
</script>

<template>
    <input
        ref="input"
        :class="[
            'w-full text-sm rounded-lg block p-2.5 border focus:outline-none',
            hasError
                ? 'bg-red-50 border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500'
                : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
        ]"
        :value="modelValue"
        :id="name"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        @input="$emit('update:modelValue', $event?.target?.value)"
    />
</template>
