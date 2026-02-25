<script setup lang="js">
import Card from "@/components/shared/Card.vue";
import Editor from "@/components/pages/project/tasks/partisals/Form/Editor.vue";
import Text from "@/components/shared/Text.vue";
import Button from "@/components/shared/Button.vue";
import { ref } from "vue";
import InteractiveToast from "@/components/shared/InteractiveToast.vue";

const emit = defineEmits(['update']);
const props = defineProps({
    title: {
        type: String
    },
    val: {
        type: String
    },
    id: {
        type: Number
    }
});

const model = ref({
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
    <Card>
        <div class="p-4 space-y-4">
            <Text v-model="model.title" placeholder="Note title" />

            <div class="w-full">
                <Editor
                    :modelValue="val"
                    @update:markdown="(val) => (model.val = val)"
                />
            </div>
            <div class="flex gap-2">
                <Button @click="save" size="sm">Update</Button>
                <InteractiveToast type="red">
                    <template #trigger>
                        <Button variant="danger" size="sm">Delete</Button>
                    </template>
                    <template #title>Are you sure?</template>
                    <template #content>
                        You are about to delete
                        <b>{{ model.title }}</b>
                    </template>
                    <template #actions>
                        <Button variant="danger" size="sm" @click="deleteItem">
                            Yes, delete it
                        </Button>
                    </template>
                </InteractiveToast>
            </div>
        </div>
    </Card>
</template>
