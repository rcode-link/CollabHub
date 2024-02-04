<script setup lang="ts">
import { useErrorsStore } from "../../store/errors";
const errors = useErrorsStore();
withDefaults(
    defineProps<{
        name: string;
    }>(),
    {
        name: "",
    }
);
</script>

<template>
    <template v-if="errors.errors.hasOwnProperty(name)">
        <div
            class="text-xs text-red-800"
            v-for="err in errors.errors[name]"
            :key="err"
        >
            {{ err }}
        </div>
    </template>
</template>
