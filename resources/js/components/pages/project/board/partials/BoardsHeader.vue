<template>
  <div class="flex flex-row w-full gap-4 items-center z-[30]">
    <fwb-dropdown text="Bottom">
      <template #trigger>
        <h1 class="flex gap-1 cursor-pointer items-center">
          <KanbanIcon class="w-6 h-6" v-if="boardsState.activeBoard.type === 'kanban'"/>
          <ScrumIcon class="w-6 h-6" v-if="boardsState.activeBoard.type === 'scrum'"/>
          {{ boardsState.activeBoard.title }}
          <ArrowDownIcon class="w-2 h-2 ml-3"/>
        </h1>
      </template>
      <fwb-list-group>
        <fwb-list-group-item v-for="obj in boardsState.getBoards" class="cursor-pointer"
                             @click="() => setActiveBoard(obj)"
        >
          <KanbanIcon class="w-4 h-4" v-if="obj.type === 'kanban'"/>
          <ScrumIcon class="w-4 h-4" v-if="obj.type === 'scrum'"/>
          {{ obj.title }}
        </fwb-list-group-item>
        <fwb-list-group-item @click="() => boardModalRef.toggleModal()">
          <PlusSquare class="w-6 h-6"/> Add new board
        </fwb-list-group-item>
      </fwb-list-group>
    </fwb-dropdown>
    <SelectSprintHeader v-if="shouldSprintSelectionBeVisible"/>
      <fwb-dropdown class="ml-auto" text="Bottom" placement="left">
          <template #trigger>
              <CogsIcon class="w-4 h-4 hover:text-blue-300"/>
          </template>
          <fwb-list-group>
              <fwb-list-group-item>

                  <router-link :to="{
                                      name: 'project.board.tasks',
                                      params: route.params
                                    }">
                      Manage tasks
                  </router-link>
              </fwb-list-group-item>
              <fwb-list-group-item>
                  <router-link :to="{
                                      name: 'project.board.settings'
                                    }">
                      Board settings
                  </router-link>
              </fwb-list-group-item>

          </fwb-list-group>
      </fwb-dropdown>
    <Modal ref="boardModalRef">
      <template #header>
        <h1>Create new board</h1>
      </template>
      <template #body>
        <BoardForm ref="boardFormRef"/>
      </template>
      <template #footer>
        <fwb-button @click="() => {
          boardFormRef.submit()
        boardModalRef.toggleModal();
        }">Save
        </fwb-button>
      </template>
    </Modal>
  </div>
</template>
<script setup>
import {FwbButton, FwbDropdown, FwbListGroup, FwbListGroupItem} from "flowbite-vue";
import {useRoute, useRouter} from "vue-router";
import KanbanIcon from "../../../../shared/icons/KanbanIcon.vue";
import ScrumIcon from "../../../../shared/icons/ScrumIcon.vue";
import ArrowDownIcon from "../../../../shared/icons/ArrowDownIcon.vue";
import {useBoardsState} from "../../../../../store/boards.js";
import SelectSprintHeader from "./SelectSprintHeader.vue";
import PlusSquare from "../../../../shared/icons/PlusSquare.vue";
import {computed, ref} from "vue";
import Modal from "../../../../shared/Modal.vue";
import BoardForm from "./Form.vue";
import CogsIcon from "../../../../shared/icons/CogsIcon.vue";
import _ from 'lodash';


const route = useRoute();
const router = useRouter();
const boardsState = useBoardsState();
const boardFormRef = ref(null);
const boardModalRef = ref(null);

const shouldSprintSelectionBeVisible = computed(() => boardsState.getActiveBoard.type === 'scrum')
const setActiveBoard = ({id}) => {
  if (_.toNumber(id) === _.toNumber(route.params.board)) {
    return;
  }
  const routeData = route.params;
  delete routeData['sprint'];
  routeData['board'] = id;
  localStorage.setItem(`last_active_board_${route.params.project}`, id);
  boardsState.taskStatuses = [];
  router.push({
      params: routeData,
      query: route.query
  })
}



</script>
