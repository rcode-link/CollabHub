<script lang="js" setup>
//@ts-ignore
import SelectManager from "@/components/pages/user/partials/partials/SelectManager.vue";
//@ts-ignore
import DeleteUser from "@/components/pages/user/partials/partials/DeleteUser.vue";
//@ts-ignore
import DeactivateUser from "@/components/pages/user/partials/partials/DeactivateUser.vue";
import { useSingleUserStore } from "@/store/singleUser.js";
//@ts-ignore
import RestoreUser from "@/components/pages/user/partials/partials/RestoreUser.vue";

const singleUserStore = useSingleUserStore();
</script>

<template>
    <div class="flex flex-col gap-4" v-if="!singleUserStore.loading">
        <SelectManager />
        <div class="flex gap-4" v-if="!singleUserStore.user?.deleted_at">
            <DeleteUser />
            <DeactivateUser />
        </div>
        <div
            v-if="
                singleUserStore.user?.deleted_at &&
                singleUserStore.user?.name !== 'deleted_user'
            "
        >
            <RestoreUser />
        </div>
    </div>
</template>

<style scoped></style>
