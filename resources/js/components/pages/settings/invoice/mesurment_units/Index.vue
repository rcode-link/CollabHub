<script setup lang="js">
import Settings from "@/components/layouts/Settings.vue";
import Text from "@/components/shared/Text.vue";
import { useBreadcrumbStore } from "@/store/breadcrumb";

const breadcrumb = useBreadcrumbStore()
breadcrumb.setLinks([
    { link: '/', title: 'Home' },
    { link: { name: 'settings.base' }, title: 'Settings' },
    { title: 'Measurement Units' },
])
import {
    FwbButton,
    FwbTable,
    FwbTableBody,
    FwbTableCell,
    FwbTableHead,
    FwbTableHeadCell,
    FwbTableRow,
} from "flowbite-vue";
import { onMounted, ref } from "vue";
import Form from "@/components/pages/settings/invoice/mesurment_units/Form.vue";
const model = ref({
    val: "",
});
const list = ref();
const load = () => {
    model.value = {
        val: "",
    };
    window.axios
        .get("/api/v1/invoice/data", {
            params: {
                type: "unit",
            },
        })
        .then((res) => {
            list.value = res.data;
        });
};

onMounted(() => {
    load();
});

const save = () => {
    window.axios
        .post("/api/v1/invoice/data", {
            type: "unit",
            data: model.value,
        })
        .then(() => load());
};
</script>
<template>
    <Settings>
        <FwbTable>
            <FwbTableHead>
                <FwbTableHeadCell>Name</FwbTableHeadCell>
                <FwbTableHeadCell></FwbTableHeadCell>
            </FwbTableHead>
            <FwbTableBody>
                <Form
                    v-for="obj in list"
                    :id="obj.id ?? 0"
                    :val="obj.data.val"
                    @update="load"
                />
                <FwbTableRow>
                    <FwbTableCell> <Text v-model="model.val" /> </FwbTableCell>
                    <FwbTableCell>
                        <FwbButton @click="save">Save</FwbButton>
                    </FwbTableCell>
                </FwbTableRow>
            </FwbTableBody>
        </FwbTable>
    </Settings>
</template>
