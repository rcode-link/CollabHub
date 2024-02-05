<script setup lang="ts">
import { FwbListGroup, FwbListGroupItem, FwbHeading } from "flowbite-vue";
</script>
<template>
    <FwbHeading tag="h4">Profile</FwbHeading>
    <FwbListGroup class="w-full mb-4">
        <FwbListGroupItem>
            <router-link :to="{ name: 'settings.base' }"
                >My profile</router-link
            >
        </FwbListGroupItem>
    </FwbListGroup>
</template>
