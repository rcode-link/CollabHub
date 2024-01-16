<script setup lang="ts">

import {FwbButton, FwbDropdown, FwbListGroup, FwbListGroupItem} from "flowbite-vue";
import Modal from "../shared/Modal.vue";
import CreateProject from "../pages/project/Create.vue";
import {ref} from "vue";
import {useTasksStore} from "../../store/tasksStore.js";
import {useAbility} from "@casl/vue";
import PlusSquare from "../shared/icons/PlusSquare.vue";


const {can, rules} = useAbility()
defineProps({
  useText: false,
})

const addNewTask = () => {

}
</script>

<template>
    <fwb-dropdown text="Bottom" placement="left">
        <template #trigger>
          <PlusSquare v-if="!useText" class="w-6 h-6 " />
          <fwb-button v-if="useText">
            Create new
          </fwb-button>
        </template>
        <div class="grid">
            <fwb-list-group>
            </fwb-list-group>
        </div>
    </fwb-dropdown>

</template>

<style scoped>

</style>
