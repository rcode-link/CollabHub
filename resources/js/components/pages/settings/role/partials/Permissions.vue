<script setup>

import _ from "lodash";
import AddPermissionsModal from "./AddPermissionsModal.vue";
import Card from "../../../../shared/Card.vue";
import {useRoleStore} from "../../../../../store/roleStore.js";
const roleStore = useRoleStore();

</script>

<template>
    <Card class="flex-col ">
        <div class="flex justify-between items-center m-2">
            <h1>List of permissions in role</h1>

            <div v-if="roleStore.role.can_be_changed">
                <AddPermissionsModal />
            </div>
        </div>
        <div class="mb-1 " v-for="(obj, key) in _.groupBy(roleStore.role?.definitions, 'scope')">
            <div class="uppercase border-b mb-2">
                {{ key }}
            </div>
            <ul>
                <li v-for="def in obj" class="hover:underline flex justify-between items-center m-2">
                    {{ def.name }}
                </li>
            </ul>
        </div>
    </Card>
</template>

<style scoped>

</style>
