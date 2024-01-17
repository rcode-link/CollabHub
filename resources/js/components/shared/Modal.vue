<template>
  <span @click="showModal">
    <slot name="button"></slot>
  </span>
  <fwb-modal v-if="isShowModal" @close="closeModal">
    <template #header>
      <slot name="header"></slot>
    </template>
    <template #body>
      <slot name="body"></slot>
    </template>
    <template #footer>
      <slot name="footer"></slot>
    </template>
  </fwb-modal>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
//@ts-ignore
import { FwbButton, FwbModal } from "flowbite-vue";

const emit = defineEmits(["closed"]);
const props = withDefaults(
  defineProps<{
    hideModal: boolean;
  }>(),
  {
    hideModal: false,
  }
);

watch(
  () => props.hideModal,
  () => {
    isShowModal.value = props.hideModal;
  }
);

const isShowModal = ref(false);

function closeModal() {
  isShowModal.value = false;
  emit("closed");
}

function showModal() {
  isShowModal.value = true;
}

const toggleModal = () => {
  isShowModal.value = !isShowModal.value;
};

defineExpose({
  toggleModal,
  closeModal,
  isShowModal,
});
</script>
