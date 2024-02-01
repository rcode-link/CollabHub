<script lang="ts" setup>
import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";
import { ref, watch } from "vue";
import { useErrorsStore } from "../../store/errors";
import { DateTime } from "luxon";

interface iProps {
    modelValue: string;
    name?: string;
}
const props = withDefaults(defineProps<iProps>(), {
    name: "",
});
const emit = defineEmits<{
    (e: "update:modelValue", value: string): void;
}>();

const internalVal = ref(props.modelValue ?? DateTime.now().toLocaleString());
const errors = useErrorsStore();

watch(internalVal, () => {
    emit("update:modelValue", internalVal.value);
});
</script>

<template>
    <flat-pickr
        v-model="internalVal"
        :config="{
            altInput: true,
            time_24hr: true,
            dateFormat: 'Z',
            altFormat: 'd/m/Y',
        }"
        :class="{
            'w-full': true,
            'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500':
                !errors.errors.hasOwnProperty(name),
            'bg-red-50 border border-red-500 text-red-900 placeholder-red-700 text-sm rounded-lg focus:ring-red-500 dark:bg-gray-700 focus:border-red-500 block w-full p-2.5 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500':
                errors.errors.hasOwnProperty(name),
        }"
    />
</template>

<style scoped></style>
