<script setup>
import KanbanIcon from "../../../../shared/icons/KanbanIcon.vue";
import ScrumIcon from "../../../../shared/icons/ScrumIcon.vue";
import Text from "../../../../shared/Text.vue";
import Button from "../../../../shared/Button.vue";
import Label from "../../../../shared/Label.vue";
import { reactive } from "vue";
import { useRoute } from "vue-router";
import { useBoardsState } from "../../../../../store/boards.ts";

const route = useRoute();
const boardsState = useBoardsState();

const submit = () => {
  axios
    .post("/api/v1/boards", { ...form, project_id: route.params.project })
    .then(() => {
      boardsState.loadBoards();
    });
};

const form = reactive({
  title: "",
  type: null,
});

defineExpose({
  submit,
});
</script>

<template>
  <form @submit.prevent="submit">
    <div class="mb-4">
      <Label> Title </Label>
      <Text v-model="form.title" placeholder="Enter board title"></Text>
    </div>
    <div class="mb-4">
      <Label> Type </Label>
      <div class="grid grid-cols-2 gap-4">
        <div class="text-center flex flex-col items-center">
          <Label :for="'kanban'">
            <KanbanIcon class="w-60 h-60" />
            <div>Kanban</div>
          </Label>
          <input type="radio" id="kanban" v-model="form.type" value="kanban" />
        </div>
        <div class="text-center flex flex-col items-center">
          <Label :for="'scrum'">
            <ScrumIcon class="w-60 h-60" />
            <div>Scrum</div>
          </Label>
          <input type="radio" id="scrum" v-model="form.type" value="scrum" />
        </div>
      </div>
    </div>
    <button hidden=""></button>
  </form>
</template>

<style scoped>
</style>
