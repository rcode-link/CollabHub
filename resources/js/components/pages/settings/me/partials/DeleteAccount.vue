<script setup lang="ts">

import InteractiveToast from "../../../../shared/InteractiveToast.vue";
import {FwbButton} from "flowbite-vue";
</script>

<template>
    <ul class="">
        <li class="border-b flex justify-between p-2 m-2">
            Delete account
            <interactive-toast>
                <template #trigger>
                    <fwb-button color="red">Delete account</fwb-button>
                </template>
                <template></template>
                <template></template>
                <template></template>
            </interactive-toast>
        </li>
        <li class="border-b flex justify-between p-2 m-2">
            Deactivate account
            <interactive-toast>
                <template #trigger>
                    <fwb-button color="red">Deactivate account</fwb-button>
                </template>
                <template></template>
                <template></template>
                <template></template>
            </interactive-toast>
        </li>
    </ul>
</template>

<style scoped>

</style>
