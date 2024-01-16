<script setup lang="ts">

import Card from "../../../shared/Card.vue";
import {onMounted, ref, watch} from "vue";
import BoardForm from './partials/Form.vue';
import {FwbButton, FwbSpinner} from "flowbite-vue";
import {useRoute, useRouter} from "vue-router";
import BoardsHeader from "./partials/BoardsHeader.vue";
import {useBoardsState} from "../../../../store/boards.js";
import {useAbility} from "@casl/vue";

const route = useRoute();
const router = useRouter();
const { can, rules } = useAbility()

const boardFormRef = ref(null);
const boardsState = useBoardsState();


onMounted(() => {

  boardsState.loadBoards();
});

</script>

<template>
  <div>
    <Card v-if="boardsState.getBoards.length > 0"  class="justify-between items-center">
      <BoardsHeader/>
    </Card>
    <template v-if="!boardsState.isLoading">
      <Card v-if="boardsState.getBoards.length === 0 && can(`can-create-board.${route.params.project}`)" class="flex-col items-center">
        <div class="max-w-lg">
          <BoardForm ref="boardFormRef"/>
          <fwb-button @click="() => boardFormRef.submit()">Save</fwb-button>
        </div>
      </Card>
      <div class="mt-4">
        <router-view></router-view>
      </div>
    </template>
    <div v-if="boardsState.isLoading" class="flex justify-center mt-4">
      <fwb-spinner size="12"/>
    </div>
  </div>
</template>

