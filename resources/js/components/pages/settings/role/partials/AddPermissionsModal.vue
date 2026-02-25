<script setup>
import Modal from "@/components/shared/Modal.vue";
import Button from "@/components/shared/Button.vue";
import CheckBox from "@/components/shared/CheckBox.vue";
import { ref, watch } from "vue";
import { useRoleStore } from "@/store/roleStore";
import { toast } from "vue3-toastify";
const roleStore = useRoleStore();

const permissions = ref([]);
const selected = ref({});
const modalRef = ref(null);

const load = () => {
    axios
        .get("/api/v1/permissions")
        .then((res) => (permissions.value = res.data));
};

const save = () => {
    axios
        .put(`/api/v1/roles/${roleStore.role.id}`, {
            permissions: Object.keys(selected.value).filter(
                (item) => selected.value[item]
            ),
        })
        .then(() => {
            modalRef.value.toggleModal();
            roleStore.loadRoleData();
            toast.success(
                `Permissions updated for ${roleStore.role.title} role`,
                { theme: localStorage.getItem("color-theme") ?? "light" }
            );
        });
};

watch(
    () => roleStore.role,
    () => {
        roleStore.role.definitions.forEach((obj) => {
            selected.value[obj.id] = true;
        });
    },
    {
        immediate: true,
    }
);
</script>

<template>
    <Modal ref="modalRef">
        <template #header>Select permissions for role</template>
        <template #button>
            <Button size="sm" @click="load">Manage permissions</Button>
        </template>
        <template #body>
            <div v-for="(obj, key) in permissions" :key="key" class="mb-4 last:mb-0">
                <h4 class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                    {{ key }}
                </h4>
                <div class="space-y-1">
                    <label
                        v-for="def in obj"
                        :key="def.id"
                        class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                    >
                        <input
                            type="checkbox"
                            v-model="selected[def.id]"
                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span class="text-sm text-gray-700 dark:text-gray-300">{{ def.name }}</span>
                    </label>
                </div>
            </div>
        </template>
        <template #footer>
            <Button @click="save">Save</Button>
        </template>
    </Modal>
</template>
