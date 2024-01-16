<script setup lang="ts">
import Modal from "../../../shared/Modal.vue";
import { computed, ref, watch } from "vue";
import UserIcon from "../../../shared/UserIcon.vue";
import { useUserStore } from "../../../../store/user";
import CheckBox from "../../../shared/CheckBox.vue";
import { FwbButton } from "flowbite-vue";
import Text from "../../../shared/Text.vue";
import Label from "../../../shared/Label.vue";
import Errors from "../../../shared/Errors.vue";
import { useErrorsStore } from "../../../../store/errors";

const emits = defineEmits(["update"]);
const userState = useUserStore();
const errorsStore = useErrorsStore();
const modal = ref(null);
const response = ref({});
const selected = ref([]);
const title = ref("");
const searchUsers = ref("");
const initState = () => {
  response.value = {};
  selected.value = [];
  title.value = "";
  searchUsers.value = "";
};

const save = () => {
  errorsStore.setErrors({});
  axios
    .post("/api/v1/chats", {
      user_id: selected.value,
      title: title.value,
    })
    .then(() => {
      emits("update");
      modal.value.toggleModal();
    })
    .catch((error) => {
      if (error.response.status === 422) {
        errorsStore.setErrors(error.response.data.errors, "login");
      }
      // globalErrorMessage.value = error.response.data.data;
    });
};

const load = () => {
  if (userState.company.id && modal.value?.isShowModal) {
    axios.get(`/api/v1/company/users/${userState.company.id}`).then((res) => {
      response.value = res.data;
    });
  }
};

watch(
  () => modal.value?.isShowModal,
  () => {
    if (!modal.value?.isShowModal) {
      initState();
    }
    load();
  }
);

const results = computed(() => {
  if (!response.value.data) {
    return [];
  }
  const withoutMe = response.value.data.filter(
    (obj) => obj.id !== userState.user.id
  );
  if (searchUsers.value.length >= 3) {
    return withoutMe.filter((obj) => {
      return obj.name.toLowerCase().includes(searchUsers.value.toLowerCase());
    });
  }
  return withoutMe;
});

function selectionUpdated(val) {
  if (val.checked) {
    selected.value.push(val.val);
    return;
  }
  selected.value.splice(selected.value.indexOf(val.val), 1);
}

defineExpose({
  modal,
});
</script>

<template>
  <Modal ref="modal">
    <template #header> Create private or group chat </template>
    <template #body>
      <div
        :class="{
          'mb-4': true,
          'cursor-not-allowed': selected.length < 2,
        }"
      >
        <Label
          :class="{
            '!text-gray-400': selected.length < 2,
          }"
          :forInput="'title'"
          :disabled="selected.length < 2"
          >Group chat title</Label
        >
        <Text
          id="title"
          :class="{
            'cursor-not-allowed !placeholder-gray-200': selected.length < 2,
          }"
          :disabled="selected.length < 2"
          v-model="title"
          placeholder="Group chat title"
        />
        <Errors name="title" />
      </div>
      <hr />
      <div class="mt-4">
        <Label :forInput="'searchUsers'">Search users</Label>
        <Text
          id="searchUsers"
          v-model="searchUsers"
          placeholder="Search users"
        />
      </div>

      <ul class="divide-y divide-gray-200 dark:divide-gray-700">
        <li
          v-for="obj in results"
          :key="obj.id + userState.onlineUsers"
          class="flex gap-4 items-center"
        >
          <CheckBox
            :id="`user_${obj.id}`"
            :checked="selected.indexOf(obj.id) > -1"
            @update="selectionUpdated"
            :value="obj.id"
          />
          <label
            :for="`user_${obj.id}`"
            class="flex gap-2 items-center text-gray-900 dark:text-white"
          >
            <UserIcon :status="false" :user="obj" />
            <div class="col-span-2 text-gray-900 dark:text-white">
              <div>
                {{ obj.name }}
              </div>
              <div>
                {{ obj.email }}
              </div>
            </div>
          </label>
        </li>
      </ul>
    </template>
    <template #footer>
      <fwb-button @click="save">Create</fwb-button>
    </template>
  </Modal>
</template>

<style scoped>
</style>
