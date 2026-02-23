<script lang="js" setup>
//@ts-ignore
import SelectUsersInCompany from "@/components/shared/SelectUsersInCompany.vue";
import { useSingleUserStore } from "@/store/singleUser.js";
//@ts-ignore
import Label from "@/components/shared/Label.vue";
const singleUserStore = useSingleUserStore();
</script>

<template>
    <div>
        <Label for-input="manager">Manager</Label>
        <SelectUsersInCompany
            name="manager"
            v-model="singleUserStore.user.manager.id"
            @selected-user="singleUserStore.updateManager"
        />
    </div>
</template>

<style scoped></style>
