<script setup lang="js">
import { useUserStore } from "../../store/user";
import { computed, ref, watch } from "vue";
import { useErrorsStore } from "../../store/errors";
import { debounce, find, toNumber } from "lodash";
import UserIcon from "./UserIcon.vue";
import Text from "./Text.vue";
import { useRoute } from "vue-router";

const errors = useErrorsStore();
const userState = useUserStore();
const route = useRoute();
const props = defineProps({
    showCleanInput: {
        type: Boolean,
        default: true
    },
    modelValue: {
        type: [String, Number],
        default: ""
    },
    name: {
        type: String,
        default: ""
    },
    form: {
        type: String,
        default: ""
    },
    disabled: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(["update:modelValue", 'selectedUser']);

const currentValue = ref(props.modelValue);
const users = ref({
    data: {}
});
const showItems = ref(false);
const searchUsers = ref("");
const loadUsers = debounce(
    () =>
        window.axios
            .get(`/api/v1/company/users/${userState.company.id}`, {
                params: {
                    user: searchUsers.value,
                    project_id: route.params.project,
                },
            })
            .then((res) => {
                users.value = res.data;
            }),
    300
);

const handleItemClick = (obj) => {
    emit("update:modelValue", obj.id);
    emit("selectedUser", obj);
    showItems.value = false;
    searchUsers.value = "";
    currentValue.value = obj.id.toString();
};

const selectedUser = computed(() => {
    return find(users.value?.data, { id: toNumber(currentValue.value) });
});

const unSelectUser = () => {
    currentValue.value = null;
    emit("update:modelValue", null);
};

watch(
    () => props.modelValue,
    () => {
        currentValue.value = props.modelValue;
    },
    {
        deep: true,
    }
);
watch(
    searchUsers,
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
        <div :id="name" @click="() => (showItems = !showItems)" :class="{
            'w-full cursor-pointer flex gap-3 items-center w-full': true,
            'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-[0.4rem] dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500':
                !errors.errors.hasOwnProperty(name),
            'bg-red-50 border border-red-500 text-red-900 placeholder-red-700 text-sm rounded-lg focus:ring-red-500 dark:bg-gray-700 focus:border-red-500 block w-full p-[0.4rem] dark:text-red-500 dark:placeholder-red-500 dark:border-red-500':
                errors.errors.hasOwnProperty(name),
        }">
            <template v-if="selectedUser">
                <UserIcon avatar-size="xs" :user="selectedUser" />
                {{ selectedUser.name }}
                <div class="ml-auto p-2" v-if="showCleanInput" @click="unSelectUser">
                    <svg class="w-2 h-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 14 14">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                    </svg>
                </div>
            </template>
            <template v-if="!selectedUser">
                <UserIcon avatar-size="xs" :user="{ avatar: '' }" />
                Select user
            </template>
        </div>
        <div v-show="showItems && !disabled" class="absolute w-full z-50 bg-white dark:bg-gray-700 shadow">
            <div class="m-2">
                <Text type="title" v-model="searchUsers" placeholder="Search for users" />
            </div>
            <div v-for="obj in users?.data" @click="() => handleItemClick(obj)" :key="`user_${obj.id}`"
                class="flex gap-3 items-center text-gray-900 dark:text-white w-full px-4 py-2 border-b border-gray-200 dark:border-gray-600 hover:bg-gray-200 hover:dark:bg-gray-500 cursor-pointer">
                <UserIcon :user="obj" />
                <p>
                    {{ obj.name }}
                </p>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
