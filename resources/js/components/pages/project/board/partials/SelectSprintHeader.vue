<script setup lang="ts">

import Modal from "../../../../shared/Modal.vue";
import PlusSquare from "../../../../shared/icons/PlusSquare.vue";
import ArrowDownIcon from "../../../../shared/icons/ArrowDownIcon.vue";
import {FwbButton, FwbCheckbox, FwbDropdown, FwbListGroup, FwbListGroupItem} from "flowbite-vue";
import Form from "./Form.vue";
import Text from "../../../../shared/Text.vue";
import Label from "../../../../shared/Label.vue";
import {reactive, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useBoardsState} from "../../../../../store/boards.js";
import {DateTime} from "luxon";
import {useAbility} from "@casl/vue";

const route = useRoute();
const router = useRouter();
const boardsState = useBoardsState();
const { can, rules } = useAbility()

//
const createSprintRef = ref(null);
const form = reactive({
  title: '',
  duration: null,
  is_active: false
})
const createSprint = () => {
  axios.post('/api/v1/sprints', {...form, board_id: boardsState.activeBoard.id}).then((res) => {
    createSprintRef.value.toggleModal();
    boardsState.addSprintToBoard(res.data);
    boardsState.setActiveSprint(res.data.id);
  })
}


const setActiveSprint = (obj) => {
  axios.put(`/api/v1/sprints/${obj.id}/activate`);
}
</script>

<template>
  <div>
    <fwb-dropdown text="Bottom">
      <template #trigger>
        <h1 class="flex gap-1 cursor-pointer items-center">
          <div class="flex flex-col" :key="boardsState.activeSprint">
            {{ boardsState.activeSprint.title }}
            <small class="text-xs" v-if="boardsState.activeSprint.start_time">
              {{ DateTime.fromSQL(boardsState.activeSprint.start_time).toLocaleString(DateTime.DATE_SHORT) }} -
              {{ DateTime.fromSQL(boardsState.activeSprint.end_time).toLocaleString(DateTime.DATE_SHORT) }}
            </small>
          </div>
          <ArrowDownIcon class="w-2 h-2 ml-3"/>
        </h1>
      </template>
      <fwb-list-group>
        <fwb-list-group-item v-for="obj in boardsState.getActiveBoard.sprint" class="cursor-pointer justify-between"
        >
          {{ obj.title }}
          <div v-if="!obj.is_active && !obj.end_time" class="hover:underline" @click="() =>setActiveSprint(obj)">
            Activate
          </div>

          <router-link class="hover:underline" v-if="obj.id !== boardsState.activeSprint.id" :to="{params: {sprint: obj.id}}">
            Open
          </router-link>
        </fwb-list-group-item>
        <fwb-list-group-item v-if="can(`can-create-board.${route.params.project}`)">
          <div class="flex gap-1 items-center cursor-pointer"
               @click="() => createSprintRef.toggleModal()"
          >
            <PlusSquare class="w-6 h-6"/>
            Create new sprint
          </div>
        </fwb-list-group-item>
      </fwb-list-group>
    </fwb-dropdown>
    <Modal ref="createSprintRef">
      <template #header>
        Create new sprint
      </template>
      <template #body>
        <form @submit.prevent="createSprint">
          <div class="mb-4">
            <Label>
              Sprint title *
            </Label>
            <Text v-model="form.title"/>
          </div>
          <div class="mb-4">
            <Label>
              Duration (in days) *
            </Label>
            <Text type="number" v-model="form.duration"/>
          </div>
          <div class="mb-4">
            <fwb-checkbox v-model="form.is_active" value="true" label="Is Sprint Active"/>
          </div>
        </form>
      </template>
      <template #footer>
        <fwb-button @click="() => createSprint()">Save</fwb-button>
      </template>
    </Modal>
  </div>
</template>

<style scoped>

</style>
