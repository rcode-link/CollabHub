<template>
  <Modal @closed="modalClosed">
    <template #button>
      <FwbButton>Invite Users</FwbButton>
    </template>
    <template #header>
      Invite users
    </template>
    <template #body>
      <form @submit.prevent="submit" class="mb-2">
        <div class="mb-4">
          <Label>Duration</Label>
          <DatePicker v-model="data.until"/>
        </div>
        <div class="mb-4">
          <Label>Number of available slots</Label>
          <Text v-model="data.number_of_invitations"></Text>
        </div>
      </form>

      <fwb-alert v-show="link" :key="showToast" :type="showToast" @click="addToClipboard">
        <h3  class="text-lg font-medium">
          {{ showToast === 'success' ? "Link copied" : '' }}
        </h3>
        {{ link }}
      </fwb-alert>
    </template>
    <template #footer>
      <Button @click="submit">Generate</Button>
    </template>
  </Modal>
</template>
<script setup>
import Modal from "../../../../shared/Modal.vue";
import {FwbAlert, FwbButton} from "flowbite-vue";
import Label from "../../../../shared/Label.vue";
import {reactive, ref, watch} from "vue";
import {useUserStore} from "../../../../../store/user.js";
import Button from "../../../../shared/Button.vue";
import useClipboard from 'vue-clipboard3'
import 'flatpickr/dist/flatpickr.css';
import DatePicker from "../../../../shared/DatePicker.vue";
import Text from "../../../../shared/Text.vue";

const link = ref(null);
const showToast = ref('info');
const userData = useUserStore();
const data = reactive({
  until: null,
  number_of_invitations: null
})
const emit = defineEmits(['update:list'])

const {toClipboard} = useClipboard()
const addToClipboard = async () => {
  try {
    await toClipboard(link.value)
    showToast.value = 'success'
    setTimeout(() => {
      showToast.value = 'info';
    }, 3000);
  } catch (e) {
    showToast.value = 'danger'
  }
}

watch(() => data, () => {
  link.value = null;
}, {
  deep: true
})


const submit = () => {
  axios.post('/api/v1/company/users/invite', {
    company: userData.company.id,
    until: data.until
  }).then(res => {
    link.value = res.data
    emit('update:list')
  })
}

const modalClosed = () => {
    data.until = null;
    data.number_of_invitations = null;
    link.value = null;
}
</script>
