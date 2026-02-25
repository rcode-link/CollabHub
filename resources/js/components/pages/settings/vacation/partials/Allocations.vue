<script setup lang="js">
import { onMounted, ref, computed } from "vue";
import Modal from "@/components/shared/Modal.vue";
import Button from "@/components/shared/Button.vue";
import Text from "@/components/shared/Text.vue";
import UserIcon from "@/components/shared/UserIcon.vue";
import { useVacationGroupStore } from "@/store/vacationGroupStore";
import { useUserStore } from "@/store/user";
import { debounce } from "lodash";

const props = defineProps({
    group: { type: Object, required: true },
});

const store = useVacationGroupStore();
const userStore = useUserStore();
const modalRef = ref();
const companyUsers = ref([]);
const search = ref("");
const saving = ref({});

// Map of userId -> days_allocated for users with overrides
const allocations = ref({});

const loadData = async () => {
    const [usersRes] = await Promise.all([
        window.axios.get(`/api/v1/company/users/${userStore.company.id}`),
        store.loadAllocations(props.group.id),
    ]);
    companyUsers.value = usersRes.data.data;

    // Build allocations map from existing overrides
    allocations.value = {};
    store.userAllocations.forEach((u) => {
        allocations.value[u.id] = u.days_allocated;
    });
};

const isAllocated = (userId) => userId in allocations.value;

const filteredUsers = computed(() => {
    if (!search.value) return companyUsers.value;
    const q = search.value.toLowerCase();
    return companyUsers.value.filter(
        (u) =>
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)
    );
});

const toggleUser = async (user) => {
    if (isAllocated(user.id)) {
        delete allocations.value[user.id];
        await store.removeAllocation(props.group.id, user.id);
    } else {
        allocations.value[user.id] = props.group.days_per_year;
        await store.setAllocation(
            props.group.id,
            user.id,
            props.group.days_per_year
        );
    }
};

// Debounced save per user so typing days doesn't spam requests
const debouncedSaves = {};
const updateDays = (userId, days) => {
    allocations.value[userId] = Number(days);
    if (!debouncedSaves[userId]) {
        debouncedSaves[userId] = debounce(async (uid, d) => {
            saving.value[uid] = true;
            await store.setAllocation(props.group.id, uid, d);
            saving.value[uid] = false;
        }, 500);
    }
    debouncedSaves[userId](userId, Number(days));
};
</script>
<template>
    <Modal ref="modalRef" size="lg" @closed="() => {}">
        <template #button>
            <span @click="loadData">
                <Button size="sm" variant="soft">Allocations</Button>
            </span>
        </template>
        <template #header>
            User allocations — {{ group.name }}
            <span class="text-xs font-normal text-gray-400 ml-2">
                Default: {{ group.days_per_year }} days
            </span>
        </template>
        <template #body>
            <div class="space-y-3">
                <!-- Search -->
                <Text
                    v-model="search"
                    placeholder="Search users..."
                />

                <!-- User list -->
                <div class="max-h-80 overflow-y-auto -mx-1">
                    <div
                        v-for="user in filteredUsers"
                        :key="user.id"
                        class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                        <!-- Checkbox -->
                        <input
                            type="checkbox"
                            :checked="isAllocated(user.id)"
                            @change="toggleUser(user)"
                            class="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 cursor-pointer"
                        />

                        <!-- Avatar + name -->
                        <UserIcon :user="user" avatar-size="xs" />
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {{ user.name }}
                            </p>
                            <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {{ user.email }}
                            </p>
                        </div>

                        <!-- Days input (only when checked) -->
                        <div
                            v-if="isAllocated(user.id)"
                            class="flex items-center gap-1.5 shrink-0"
                        >
                            <input
                                type="number"
                                :value="allocations[user.id]"
                                @input="(e) => updateDays(user.id, e.target.value)"
                                min="0"
                                class="w-16 text-sm text-center rounded-lg p-1.5 border bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            <span class="text-xs text-gray-400">days</span>
                            <span
                                v-if="saving[user.id]"
                                class="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"
                            />
                        </div>

                        <!-- Default indicator (when not checked) -->
                        <span
                            v-else
                            class="text-xs text-gray-400 dark:text-gray-500 shrink-0"
                        >
                            {{ group.days_per_year }}d default
                        </span>
                    </div>

                    <p
                        v-if="!filteredUsers.length"
                        class="text-sm text-gray-500 dark:text-gray-400 text-center py-6"
                    >
                        No users found
                    </p>
                </div>
            </div>
        </template>
    </Modal>
</template>
