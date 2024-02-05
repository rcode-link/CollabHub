<script setup lang="ts">
import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";
import { ref } from "vue";
import { useErrorsStore } from "../../store/errors";
import { DateTime } from "luxon";

const errors = useErrorsStore();
const props = withDefaults(
    defineProps<{
        modelValue: string | null;
        name?: string;
    }>(),
    {
        name: "",
        modelValue: DateTime.now().toLocaleString(),
    }
);

const value = ref(props.modelValue);

const emit = defineEmits<{
    (e: "update:modelValue", value: string): void;
}>();
</script>

<template>
    <flat-pickr
        v-model="value"
        :config="{
            enableTime: true,
            noCalendar: true,
            altInput: true,
            time_24hr: true,
            dateFormat: 'Z',
            formatDate: (date, ___format, ___locale) => {
                return DateTime.fromISO(date.toISOString()).toLocaleString(
                    DateTime.TIME_24_SIMPLE
                );
            },
            onClose: (dates, ___currentDateString, ___self, ___data) => {
                emit('update:modelValue', dates[0].toISOString());
            },
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
