<script setup lang="js">
import {
    FwbTable,
    FwbTableBody,
    FwbTableHead,
    FwbTableHeadCell,
    FwbTableCell,
    FwbTableRow,
    FwbButton,
} from "flowbite-vue";
import Settings from "@/components/layouts/Settings.vue";
import { onMounted, ref } from "vue";
import Form from "./Form.vue";
import InteractiveToast from "@/components/shared/InteractiveToast.vue";

const model = ref();

const load = () => {
    window.axios.get("/api/v1/currency").then((res) => {
        model.value = res.data.data;
    });
};

onMounted(() => {
    load();
});

const deleteItem = (id) => {
    window.axios.delete(`/api/v1/currency/${id}`).then(() => {
        load();
    });
};
</script>
<template>
    <Settings>
        <FwbTable class="w-full">
            <FwbTableHead>
                <FwbTableHeadCell>Currency</FwbTableHeadCell>
                <FwbTableHeadCell>ISO</FwbTableHeadCell>
                <FwbTableHeadCell>Format</FwbTableHeadCell>
                <FwbTableHeadCell>Examples</FwbTableHeadCell>
                <FwbTableHeadCell>
                    <Form @update="load" />
                </FwbTableHeadCell>
            </FwbTableHead>
            <FwbTableBody>
                <FwbTableRow v-for="obj in model">
                    <FwbTableCell>{{ obj.currency }}</FwbTableCell>
                    <FwbTableCell>{{ obj.iso }}</FwbTableCell>
                    <FwbTableCell>{{ obj.format }}</FwbTableCell>
                    <FwbTableCell>
                        {{
                            Number(5).toLocaleString(obj.format, {
                                style: "currency",
                                currency: obj.currency,
                            })
                        }}
                        |
                        {{
                            Number(50).toLocaleString(obj.format, {
                                style: "currency",
                                currency: obj.currency,
                            })
                        }}
                        |
                        {{
                            Number(5000).toLocaleString(obj.format, {
                                style: "currency",
                                currency: obj.currency,
                            })
                        }}
                    </FwbTableCell>
                    <FwbTableCell>
                        <InteractiveToast>
                            <template #trigger>
                                <FwbButton size="xs" color="red"
                                    >Delete</FwbButton
                                >
                            </template>
                            <template #title>Are you sure?</template>
                            <template #content>
                                You are about to delete <b>{{ obj.currency }}</b
                                >?
                            </template>
                            <template #actions>
                                <FwbButton
                                    @click="() => deleteItem(obj.id)"
                                    size="xs"
                                >
                                    Yes, Delete it!
                                </FwbButton>
                            </template>
                        </InteractiveToast>
                    </FwbTableCell>
                </FwbTableRow>
            </FwbTableBody>
        </FwbTable>
    </Settings>
</template>
