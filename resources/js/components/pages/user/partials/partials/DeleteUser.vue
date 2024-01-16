<script setup>

import {FwbButton, FwbP} from "flowbite-vue";
import InteractiveToast from "../../../../shared/InteractiveToast.vue";
import {useSingleUserStore} from "../../../../../store/singleUser";
const  singleUserStore = useSingleUserStore();
</script>

<template>
    <interactive-toast>
        <template #trigger>
            <fwb-button color="red">Delete</fwb-button>
        </template>
        <template #title>
            You are about to delete user.
        </template>
        <template #content>
            Are you sure you want to delete user:
            <fwb-p>
                Name: {{ singleUserStore.user.name }}
            </fwb-p>
            <fwb-p>
                Email: {{ singleUserStore.user.email }}
            </fwb-p>
        </template>
        <template #actions>
            <fwb-button color="red" @click="singleUserStore.deleteUser" size="xs">Yes, delete</fwb-button>
        </template>
    </interactive-toast>
</template>

<style scoped>

</style>
