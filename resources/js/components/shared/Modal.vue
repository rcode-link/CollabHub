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

<script lang="js" setup>
import { ref, watch } from "vue";
import { FwbButton, FwbModal } from "flowbite-vue";

const emit = defineEmits(["closed"]);
const props = defineProps({
        hideModal: {
            type: Boolean,
            default: false
        }
    });
const isShowModal = ref(false);

watch(
    () => props.hideModal,
    () => {
        isShowModal.value = props.hideModal;
    },
    {
        immediate: true,
    }
);

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
