<script setup lang="js">
import { ref } from "vue";
import Modal from "@/components/shared/Modal.vue";
import Button from "@/components/shared/Button.vue";
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
            <Button size="sm">Add currency</Button>
        </template>
        <template #header>Add currency</template>
        <template #body>
            <form @submit.prevent="save" class="space-y-4">
                <div>
                    <Label for-input="currency">Currency</Label>
                    <Text name="currency" v-model="model.currency" />
                    <Errors name="currency" />
                </div>
                <div>
                    <Label for-input="iso">ISO</Label>
                    <Text name="iso" v-model="model.iso" />
                    <Errors name="iso" />
                </div>
                <div>
                    <Label for-input="format">Format</Label>
                    <Text name="format" v-model="model.format" />
                    <Errors name="format" />
                </div>
                <div
                    :key="model.currency + model.format"
                    v-if="model.currency.length && model.format.length"
                    class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300"
                >
                    <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Preview</p>
                    {{
                        Number(5).toLocaleString(model.format, {
                            style: "currency",
                            currency: model.currency,
                        })
                    }}
                    |
                    {{
                        Number(50).toLocaleString(model.format, {
                            style: "currency",
                            currency: model.currency,
                        })
                    }}
                    |
                    {{
                        Number(5000).toLocaleString(model.format, {
                            style: "currency",
                            currency: model.currency,
                        })
                    }}
                </div>
            </form>
        </template>
        <template #footer>
            <Button @click="save">Save</Button>
        </template>
    </Modal>
</template>
