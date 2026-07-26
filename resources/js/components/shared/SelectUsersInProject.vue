<script setup>
import { computed, ref, watch } from "vue";
import { useErrorsStore } from "@/store/errors";
import { debounce } from "@/functions/debounce";
import UserIcon from "@/components/shared/UserIcon.vue";
import Text from "@/components/shared/Text.vue";
import { useRoute } from "vue-router";
import { useDropdownPanel } from "@/functions/useDropdownPanel";

const errors = useErrorsStore();
const route = useRoute();
const props = defineProps({
    showCleanInput: true,
    modelValue: "",
    name: "",
    form: "",
    disabled: false,
    projectId: {
        type: [String, Number],
        default: null
    },
    size: {
        type: String,
        default: 'md'
    }
});

const emit = defineEmits(["update:modelValue"]);

const currentValue = ref(props.modelValue);
const users = ref([]);
const showItems = ref(false);
const searchUsers = ref("");
const timer = ref(null);
const trigger = ref(null);
const panel = ref(null);

const { panelStyle } = useDropdownPanel(showItems, trigger, panel, () => {
    showItems.value = false;
});
const loadUsers = debounce(() => {
    // Use projectId prop if provided, otherwise fallback to route.params.project
    const projectId = props.projectId || route.params.project;

    if (!projectId) {
        users.value = { data: [] };
        return;
    }

    axios
        .get(`/api/v1/users/project`, {
            params: {
                user: searchUsers.value,
                project_id: projectId,
            },
        })
        .then((res) => {
            users.value = res.data;
        });
}, 300);

const handleItemClick = ({ id }) => {
    emit("update:modelValue", id);
    showItems.value = false;
    searchUsers.value = "";
    currentValue.value = id;
    console.log("working");
};

const selectedUser = computed(() => {
    return users.value.data?.find(obj => obj.id === Number(currentValue.value));
});

const unSelectUser = (e) => {
    currentValue.value = null;
    emit("update:modelValue", null);
};

watch(
    [() => props.projectId, searchUsers],
    () => {
        loadUsers();
    },
    {
        immediate: true,
    }
);
</script>

<template>
    <div class="relative">
        <div
            ref="trigger"
            :id="name"
            @click="() => (showItems = !showItems)"
            :class="[
                'w-full cursor-pointer flex items-center gap-2 rounded-lg border transition-colors',
                size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm',
                errors.errors.hasOwnProperty(name)
                    ? 'border-red-500 bg-red-50 text-red-900 dark:bg-gray-700 dark:text-red-500 dark:border-red-500'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white',
            ]"
        >
            <template v-if="selectedUser">
                <UserIcon avatar-size="xs" :user="selectedUser" :status="false" />
                <span class="truncate">{{ selectedUser.name }}</span>
                <button v-if="showCleanInput" class="ml-auto p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" @click.stop="unSelectUser">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 14 14">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                    </svg>
                </button>
            </template>
            <template v-else>
                <UserIcon avatar-size="xs" :user="{ avatar: '' }" :status="false" />
                <span class="text-gray-400 dark:text-gray-500">Select user</span>
            </template>
        </div>
        <Teleport to="body">
            <div v-show="showItems && !disabled" ref="panel" :style="panelStyle"
                class="z-[100] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden">
                <div class="p-2">
                    <Text type="title" v-model="searchUsers" placeholder="Search for users" />
                </div>
                <div class="max-h-60 overflow-y-auto">
                    <div
                        v-for="(obj, index) in users.data"
                        :key="index"
                        @click="() => handleItemClick(obj)"
                        class="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/60 cursor-pointer transition-colors"
                    >
                        <UserIcon :user="obj" avatar-size="xs" />
                        <span>{{ obj.name }}</span>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<style scoped></style>
