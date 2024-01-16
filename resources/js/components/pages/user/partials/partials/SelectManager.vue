<script setup>

import {FwbSelect} from "flowbite-vue";
import SelectUsersInCompany from "../../../../shared/SelectUsersInCompany.vue";
import {ref} from "vue";
import {useSingleUserStore} from "../../../../../store/singleUser.js";
import Label from "../../../../shared/Label.vue";
const  singleUserStore = useSingleUserStore();

</script>

<template>
   <div>
       <Label for-input="manager">Manager</Label>
       <SelectUsersInCompany name="manager" v-model="singleUserStore.user.manager.id" @selected-user="singleUserStore.updateManager"/>
   </div>
</template>

<style scoped>

</style>
