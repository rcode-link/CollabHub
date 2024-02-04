<script setup lang="ts">
import Card from "@/components/shared/Card.vue";
import Editor from "@/components/pages/project/tasks/partisals/Form/Editor.vue";
import Text from "@/components/shared/Text.vue";
import { FwbButton } from "flowbite-vue";
import { ref } from "vue";
import InteractiveToast from "@/components/shared/InteractiveToast.vue";
import { iData } from "@/functions/invoiceDataInterface";

const emit = defineEmits<{
    (e: "update"): void;
}>();
const props = defineProps<{
    title: string;
    val: string;
    id: number;
}>();

const model = ref<iData>({
    title: props.title,
    val: props.val,
});

const save = () => {
    window.axios
        .put(`/api/v1/invoice/data/${props.id}`, {
            type: "note",
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
    <Card class="flex-col gap-4">
        <Text v-model="model.title" placeholder="Note title" />

        <div class="w-full mb-2">
            <Editor
                :modelValue="val"
                @update:markdown="(val) => (model.val = val)"
            />
        </div>
        <div class="flex gap-4">
            <FwbButton @click="save">Update</FwbButton>
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
        </div>
    </Card>
</template>
