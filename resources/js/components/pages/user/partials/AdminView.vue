<script setup>

import SelectManager from "./partials/SelectManager.vue";
import DeleteUser from "./partials/DeleteUser.vue";
import DeactivateUser from "./partials/DeactivateUser.vue";
import {useSingleUserStore} from "../../../../store/singleUser.js";
import RestoreUser from "./partials/RestoreUser.vue";

const singleUserStore = useSingleUserStore();
</script>

<template>
    <div class="flex flex-col gap-4" v-if="!singleUserStore.loading">
        <SelectManager/>
        <div class="flex gap-4" v-if="!singleUserStore.user.deleted_at">
            <DeleteUser/>
            <DeactivateUser/>
        </div>
        <div v-if="singleUserStore.user.deleted_at && singleUserStore.user.name !== 'deleted_user'">
            <RestoreUser/>
        </div>
    </div>
</template>

<style scoped>

</style>
