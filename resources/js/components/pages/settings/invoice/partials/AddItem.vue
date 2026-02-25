<script setup lang="js">
import Modal from "@/components/shared/Modal.vue";
import Button from "@/components/shared/Button.vue";
import Label from "@/components/shared/Label.vue";
import Text from "@/components/shared/Text.vue";
import { ref } from "vue";

const modalRef = ref();
const emit = defineEmits(['update']);
const model = ref({
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
            <Button size="sm">Add item</Button>
        </template>
        <template #body>
            <form @submit.prevent="save" class="space-y-4">
                <div>
                    <Label for-input="title">Name</Label>
                    <Text name="title" v-model="model.title" />
                </div>
                <div>
                    <Label for-input="price">Price</Label>
                    <Text name="price" v-model="model.price" />
                </div>
            </form>
        </template>
        <template #footer>
            <Button @click="save">Save</Button>
        </template>
    </Modal>
</template>
