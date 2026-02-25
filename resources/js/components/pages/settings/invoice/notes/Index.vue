<script setup lang="js">
import Settings from "@/components/layouts/Settings.vue";
import Button from "@/components/shared/Button.vue";
import { onMounted, ref } from "vue";
import { useBreadcrumbStore } from "@/store/breadcrumb";
import Card from "@/components/shared/Card.vue";
import Editor from "@/components/pages/project/tasks/partisals/Form/Editor.vue";
import Text from "@/components/shared/Text.vue";
import Note from "@/components/pages/settings/invoice/notes/partials/Note.vue";

const breadcrumb = useBreadcrumbStore()
breadcrumb.setLinks([
    { link: '/', title: 'Home' },
    { link: { name: 'settings.base' }, title: 'Settings' },
    { title: 'Invoice Notes' },
])

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
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Note
                v-for="obj in list"
                :key="obj.id"
                :id="obj.id ?? 0"
                :title="obj.data.title ?? ''"
                :val="obj.data.val"
                @update="load"
            />

            <Card>
                <div class="p-4 space-y-4">
                    <h3 class="text-sm font-medium text-gray-900 dark:text-white">New Note</h3>
                    <Text v-model="model.title" placeholder="Note title" />
                    <div class="w-full">
                        <Editor
                            :modelValue="model.val"
                            @update:markdown="(val) => (model.val = val)"
                        />
                    </div>
                    <Button @click="save">Save</Button>
                </div>
            </Card>
        </div>
    </Settings>
</template>
