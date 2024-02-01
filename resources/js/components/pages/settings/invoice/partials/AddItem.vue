<script setup lang="ts">
import { FwbButton } from "flowbite-vue";
import Modal from "../../../../shared/Modal.vue";
import Label from "../../../../shared/Label.vue";
import Text from "../../../../shared/Text.vue";
import { ref } from "vue";
interface iItem {
    title: string;
    price: string;
}

const modalRef = ref();
const emit = defineEmits<{
    (e: "update", value: null): void;
}>();
const model = ref<iItem>({
    title: "",
    price: "0",
});
const save = () => {
    window.axios.post("/api/v1/billing-items", model.value).then(() => {
        modalRef.value?.closeModal();
        emit("update", null);
    });
};
</script>
<template>
    <Modal ref="modalRef">
        <template #button>
            <FwbButton size="xs" class="ml-auto">Add item</FwbButton>
        </template>
        <template #body>
            <form @submit.prevent="save">
                <div class="mb-4">
                    <Label for-input="title">Name</Label>
                    <Text name="title" v-model="model.title" />
                </div>
                <div class="mb-4">
                    <Label for-input="price">Price</Label>
                    <Text name="price" v-model="model.price" />
                </div>
            </form>
        </template>
        <template #footer>
            <FwbButton @click="save">Save</FwbButton>
        </template>
    </Modal>
</template>
