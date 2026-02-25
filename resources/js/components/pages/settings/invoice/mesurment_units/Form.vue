<script setup lang="js">
import Text from "@/components/shared/Text.vue";
import { ref } from "vue";
import InteractiveToast from "@/components/shared/InteractiveToast.vue";
import Button from "@/components/shared/Button.vue";

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
    <tr class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
        <td class="px-4 py-3">
            <Text v-model="model.val" />
        </td>
        <td class="px-4 py-3">
            <div class="flex gap-2 justify-end">
                <InteractiveToast type="red">
                    <template #trigger>
                        <Button variant="danger" size="sm">Delete</Button>
                    </template>
                    <template #title>Are you sure?</template>
                    <template #content>
                        You are about to delete
                        <b>{{ model.val }}</b>
                    </template>
                    <template #actions>
                        <Button variant="danger" size="sm" @click="deleteItem">
                            Yes, delete it
                        </Button>
                    </template>
                </InteractiveToast>
                <Button @click="save" size="sm">Update</Button>
            </div>
        </td>
    </tr>
</template>
