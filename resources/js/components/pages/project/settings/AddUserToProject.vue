<template>
  <Modal ref="addUserRef">
    <template #button>
      <fwb-button size="sm">Add user(s)</fwb-button>
    </template>
    <template #body>
      <SelectUsersInCompany v-model="userForm.userId" @selected-user="(obj) => userForm.user = obj"/>

      <div class="mt-4">
        <div v-for="obj in permissions">
          <fwb-checkbox v-model="userForm.permissions[obj.id]" :label="obj.name"/>
        </div>
      </div>

      <hr class="mt-1 mb-1">
      <h1>Added users</h1>
      <div v-for="(obj, index) in usersToBeAdded" class="grid grid-cols-4">
        <div class="flex gap-1 items-center">
          <UserIcon :user="obj"/>
          {{ obj.user.name }}
        </div>
        <div class="col-span-2">
          {{
          obj.permissions.map(item => {
          return _.find(permissions, {'id': _.toNumber(item)})?.name
          }).join('; ')
          }}
        </div>
        <div>
          <InteractiveToast>
            <template #trigger>
              <fwb-button color="red">Remove</fwb-button>
            </template>
            <template #content>
              You are about to remove added user, are you sure?
            </template>
            <template #actions>
              <fwb-button @click="() => usersToBeAdded.splice(index, 1)" size="xs">Yes, remove it!</fwb-button>
            </template>
          </InteractiveToast>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex">
        <fwb-button @click="addUserToList">Add user</fwb-button>
        <fwb-button @click="save" color="alternative" class="ml-auto">Save</fwb-button>
      </div>
    </template>
  </Modal>
</template>
<script setup>
import SelectUsersInCompany from "../../../shared/SelectUsersInCompany.vue";
import Modal from '../../../shared/Modal.vue'
import {FwbCheckbox, FwbButton} from "flowbite-vue";
import UserIcon from "../../../shared/UserIcon.vue";
import {reactive, ref} from "vue";
import _ from 'lodash'
import InteractiveToast from "../../../shared/InteractiveToast.vue";
import {useRoute} from "vue-router";
const userForm = reactive({
  userId: null,
  user: null,
  permissions: {}
});
const emit = defineEmits(['update'])
const usersToBeAdded = ref([]);
const permissions = ref([]);
const addUserRef = ref(null);
const route = useRoute();
const addUserToList = () => {
  usersToBeAdded.value.push({
    userId: userForm.userId,
    permissions: Object.keys(userForm.permissions),
    user: userForm.user
  })
  userForm.permissions = {};
  userForm.user = null;
}

const save = () => {
  axios.put(`/api/v1/projects/${route.params.project}/add-user`, usersToBeAdded.value).then(() => {
      addUserRef.value.closeModal();
      emit('update');
  });
}

const load = () => {
  axios.get('/api/v1/permissions', {
    params: {
      scope: ['project']
    }
  }).then(res => permissions.value = res.data)
}
load();
</script>
