<script setup>
import {onMounted, ref, watch} from 'vue';
import {useErrorsStore} from "../../store/errors.js";
const errors = useErrorsStore();
defineProps({
    name: '',
});

</script>

<template>
   <template v-if="errors.errors.hasOwnProperty(name)">
        <div class="text-xs text-red-800" v-for="err in errors.errors[name]">
            {{ err }}
        </div>
   </template>
</template>
