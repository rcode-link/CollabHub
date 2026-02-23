<script setup lang="js">
import { FwbButton } from "flowbite-vue";
import Settings from "@/components/layouts/Settings.vue";
import { onMounted, ref } from "vue";
import { useBreadcrumbStore } from "@/store/breadcrumb";

const breadcrumb = useBreadcrumbStore()
breadcrumb.setLinks([
    { link: '/', title: 'Home' },
    { link: { name: 'settings.base' }, title: 'Settings' },
    { title: 'Invoice Notes' },
])
import Card from "@/components/shared/Card.vue";
import Editor from "@/components/pages/project/tasks/partisals/Form/Editor.vue";
import Text from "@/components/shared/Text.vue";
import Note from "@/components/pages/settings/invoice/notes/partials/Note.vue";
const model = ref({
    val: "",
    title: "",
});
const list = ref();
const load = () => {
    model.value = {
        val: "",
        title: "",
    };
    window.axios
        .get("/api/v1/invoice/data", {
            params: {
                type: "note",
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
            type: "note",
            data: model.value,
        })
        .then(() => load());
};
</script>
<template>
    <Settings>
        <div class="grid grid-cols-2 gap-4">
            <Note
                v-for="obj in list"
                :id="obj.id ?? 0"
                :title="obj.data.title ?? ''"
                :val="obj.data.val"
                @update="load"
            />

            <Card class="flex-col gap-4">
                <Text v-model="model.title" placeholder="Note title" />
                <div class="w-full mb-2">
                    <Editor
                        :modelValue="model.val"
                        @update:markdown="(val) => (model.val = val)"
                    />
                </div>
                <FwbButton @click="save">Save</FwbButton>
            </Card>
        </div>
    </Settings>
</template>
