<script setup>
import {
    FwbTable,
    FwbTableBody,
    FwbTableHead,
    FwbTableHeadCell,
    FwbTableCell,
    FwbTableRow,
    FwbButton,
} from "flowbite-vue";
const props = defineProps(["obj"]);
const emit = defineEmits(["update"]);
const formatNumberToCUrrencry = (num) => {
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
    <FwbTableCell>{{ obj.currency }}</FwbTableCell>
    <FwbTableCell>{{ obj.iso }}</FwbTableCell>
    <FwbTableCell>{{ obj.format }}</FwbTableCell>
    <FwbTableCell>
        {{ formatNumberToCUrrencry(5) }}
        |
        {{ formatNumberToCUrrencry(50) }}
        |
        {{ formatNumberToCUrrencry(500) }}
    </FwbTableCell>
    <FwbTableCell>
        <InteractiveToast>
            <template #trigger>
                <FwbButton size="xs" color="red">Delete</FwbButton>
            </template>
            <template #title>Are you sure?</template>
            <template #content>
                You are about to delete <b>{{ obj.currency }}</b
                >?
            </template>
            <template #actions>
                <FwbButton @click="() => deleteItem(obj.id)" size="xs">
                    Yes, Delete it!
                </FwbButton>
            </template>
        </InteractiveToast>
    </FwbTableCell>
</template>
