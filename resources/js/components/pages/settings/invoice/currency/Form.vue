<script setup lang="js">
import { FwbButton } from "flowbite-vue";
import { ref } from "vue";
import Modal from "@/components/shared/Modal.vue";
import Label from "@/components/shared/Label.vue";
import Text from "@/components/shared/Text.vue";
import Errors from "@/components/shared/Errors.vue";

const emit = defineEmits(['update']);

const modalRef = ref();
const model = ref({
    id: null,
    currency: "",
    iso: "",
    format: "",
});

const closed = () => {
    model.value = {
        id: null,
        currency: "",
        iso: "",
        format: "",
    };
};

const save = () => {
    window.axios
        .post("/api/v1/currency", {
            ...model.value,
        })
        .then(() => {
            emit("update");
            modalRef.value.closeModal();
        });
};
</script>
<template>
    <Modal ref="modalRef" @closed="closed">
        <template #button>
            <FwbButton size="xs">Add currency</FwbButton>
        </template>
        <template #body>
            <form @submit.prevent="save">
                <div class="mb-4">
                    <Label for-input="currency">Currency</Label>
                    <Text name="currency" v-model="model.currency" />
                    <Errors name="currency" />
                </div>
                <div class="mb-4">
                    <Label for-input="iso">ISO</Label>
                    <Text name="iso" v-model="model.iso" />
                    <Errors name="iso" />
                </div>
                <div class="mb-4">
                    <Label for-input="format">Format</Label>
                    <Text name="format" v-model="model.format" />
                    <Errors name="format" />
                </div>
                <div
                    class="mb-4"
                    :key="model.currency + model.format"
                    v-if="model.currency.length && model.format.length"
                >
                    {{
                        Number(5).toLocaleString(model.format, {
                            style: "currency",
                            currency: model.currency,
                        })
                    }}
                    <br />
                    {{
                        Number(50).toLocaleString(model.format, {
                            style: "currency",
                            currency: model.currency,
                        })
                    }}
                    <br />
                    {{
                        Number(5000).toLocaleString(model.format, {
                            style: "currency",
                            currency: model.currency,
                        })
                    }}
                </div>
            </form>
        </template>
        <template #header>Add currency</template>
        <template #footer>
            <FwbButton @click="save">Save</FwbButton>
        </template>
    </Modal>
</template>
