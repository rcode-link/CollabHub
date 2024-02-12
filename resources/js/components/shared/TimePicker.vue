<script setup lang="ts">
import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";
import { useErrorsStore } from "../../store/errors";
import { DateTime } from "luxon";
import { ref, watch } from "vue";

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

const value = ref<string>();

const emit = defineEmits<{
    (e: "update:modelValue", value: string | null): void;
}>();

watch(
    () => props.modelValue,
    () => {
        value.value = props.modelValue ?? DateTime.now().toUTC().toISO();
    }
);

const changed = (
    dates: Date[],
    __currentDateString: string,
    __self: any,
    __data?: any
) => {
    if (dates.length) {
        emit(
            "update:modelValue",
            DateTime.fromISO(dates[0].toString()).toUTC().toISO()
        );
    }
};
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
            altFormat: 'H:i',
            onChange: changed,
        }"
        :class="{
            'w-full': true,
            '': !errors.errors.hasOwnProperty(name),
            'bg-red-50 border border-red-500 text-red-900 placeholder-red-700 text-sm rounded-lg focus:ring-red-500 dark:bg-gray-700 focus:border-red-500 block w-full p-2.5 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500':
                errors.errors.hasOwnProperty(name),
        }"
    />
</template>

<style scoped></style>
