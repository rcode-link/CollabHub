<script setup lang="js">
import Card from "@/components/shared/Card.vue";
import Label from "@/components/shared/Label.vue";
import Button from "@/components/shared/Button.vue";
import UiSelect from "@/components/shared/ui/Select.vue";
import SearchSelect from "@/components/shared/ui/SearchSelect.vue";
import { computed, reactive, ref, watch } from "vue";
import { useRoleStore } from "@/store/roleStore";
import { toast } from "vue3-toastify";

const roleStore = useRoleStore();
const model = reactive({
    resource_type: null,
    resource: null,
});

const resources = ref();
const list = ref();

const loadCompany = () => {
    axios
        .get("/api/v1/role/resources", {
            params: model,
        })
        .then((obj) => (resources.value = obj.data));
};

const resourceOptions = computed(() =>
    (resources.value ?? []).map(r => ({ value: r.value, label: r.name }))
);

watch(
    () => model.resource_type,
    () => {
        loadCompany();
    },
    {
        deep: true,
    }
);
const load = () => {
    window.axios
        .get(`/api/v1/role/resources/${roleStore.activeRole}`)
        .then((res) => (list.value = res.data));
};
const save = () => {
    window.axios
        .post(`/api/v1/role/resources/${roleStore.activeRole}`, model)
        .then(() => {
            toast.success(
                `New resource added to ${roleStore.role.title} role`,
                { theme: localStorage.getItem("color-theme") ?? "light" }
            );
        });
};

load();
</script>

<template>
    <div class="space-y-4">
        <Card>
            <div class="p-5">
                <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-4">Add resource to role</h3>
                <form @submit.prevent="save" class="space-y-4">
                    <div>
                        <Label>Type</Label>
                        <UiSelect v-model="model.resource_type">
                            <option value="">Select type...</option>
                            <option value="company">Company</option>
                            <option value="project">Project</option>
                        </UiSelect>
                    </div>
                    <div>
                        <Label>Resource</Label>
                        <SearchSelect
                            v-model="model.resource"
                            :options="resourceOptions"
                            placeholder="Select resource..."
                            search-placeholder="Search..."
                        />
                    </div>
                    <Button type="submit">Save</Button>
                </form>
            </div>
        </Card>

        <Card v-if="list?.length">
            <div class="p-5">
                <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Assigned resources</h3>
                <div class="space-y-2">
                    <div
                        v-for="obj in list"
                        :key="obj.id"
                        class="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800"
                    >
                        {{ obj.resourcable?.name }}
                    </div>
                </div>
            </div>
        </Card>
    </div>
</template>
