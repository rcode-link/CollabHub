<script setup>
import InteractiveToast from "@/components/shared/InteractiveToast.vue";
import Button from "@/components/shared/Button.vue";

const props = defineProps(["obj"]);
const emit = defineEmits(["update"]);

const formatNumberToCurrency = (num) => {
    try {
        return Number(num).toLocaleString(props.obj.format, {
            style: "currency",
            currency: props.obj.currency,
        });
    } catch (err) {
        return "nan";
    }
};

const deleteItem = (id) => {
    window.axios.delete(`/api/v1/currency/${id}`).then(() => {
        emit("update");
    });
};
</script>
<template>
    <tr class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
        <td class="px-4 py-3">{{ obj.currency }}</td>
        <td class="px-4 py-3">{{ obj.iso }}</td>
        <td class="px-4 py-3">{{ obj.format }}</td>
        <td class="px-4 py-3 font-mono text-xs">
            {{ formatNumberToCurrency(5) }}
            |
            {{ formatNumberToCurrency(50) }}
            |
            {{ formatNumberToCurrency(500) }}
        </td>
        <td class="px-4 py-3 text-right">
            <InteractiveToast type="red">
                <template #trigger>
                    <Button variant="danger" size="sm">Delete</Button>
                </template>
                <template #title>Are you sure?</template>
                <template #content>
                    You are about to delete <b>{{ obj.currency }}</b>?
                </template>
                <template #actions>
                    <Button
                        variant="danger"
                        size="sm"
                        @click="() => deleteItem(obj.id)"
                    >
                        Yes, delete it
                    </Button>
                </template>
            </InteractiveToast>
        </td>
    </tr>
</template>
