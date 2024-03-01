<script setup lang="js">
import Text from "@/components/shared/Text.vue";
import { ref } from "vue";
import InteractiveToast from "@/components/shared/InteractiveToast.vue";
import { FwbButton, FwbTableCell, FwbTableRow } from "flowbite-vue";
const emit = defineEmits(['update']);
const props = defineProps({
    val: {
        type: String
    },
    id: {
        type: Number
    }
});

const model = ref({
    val: props.val,
});

const save = () => {
    window.axios
        .put(`/api/v1/invoice/data/${props.id}`, {
            type: "unit",
            data: model.value,
        })
        .then(() => emit("update"));
};
const deleteItem = () => {
    window.axios
        .delete(`/api/v1/invoice/data/${props.id}`)
        .then(() => emit("update"));
};
</script>
<template>
    <FwbTableRow>
        <FwbTableCell>
            <Text v-model="model.val" />
        </FwbTableCell>
        <FwbTableCell class="flex gap-4 justify-end">
            <InteractiveToast>
                <template #trigger>
                    <FwbButton color="red">Delete</FwbButton>
                </template>
                <template #title> You are sure? </template>
                <template #content>
                    You are about to delete
                    <b>
                        {{ model.title }}
                    </b>
                </template>
                <template #actions>
                    <FwbButton @click="deleteItem" size="xs"
                        >Yes, Delete it!</FwbButton
                    >
                </template>
            </InteractiveToast>
            <FwbButton @click="save">Update</FwbButton>
        </FwbTableCell>
    </FwbTableRow>
</template>
