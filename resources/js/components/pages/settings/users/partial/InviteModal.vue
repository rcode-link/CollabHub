<script setup>
import Modal from "@/components/shared/Modal.vue";
import { useRoleStore } from "@/store/roleStore";
import Label from "@/components/shared/Label.vue";
import { reactive, ref, watch } from "vue";
import { useUserStore } from "@/store/user";
import Button from "@/components/shared/Button.vue";
import UiSelect from "@/components/shared/ui/Select.vue";
import useClipboard from 'vue-clipboard3';
import DatePicker from "@/components/shared/DatePicker.vue";
import Text from "@/components/shared/Text.vue";

const role = useRoleStore();
const link = ref(null);
const showToast = ref('info');
const userData = useUserStore();
const data = reactive({
    until: null,
    number_of_invitations: null,
    role: null
})
const emit = defineEmits(['update:list'])

const { toClipboard } = useClipboard()
const addToClipboard = async () => {
    try {
        await toClipboard(link.value)
        showToast.value = 'success'
        setTimeout(() => {
            showToast.value = 'info';
        }, 3000);
    } catch (e) {
        showToast.value = 'danger'
    }
}

watch(() => data, () => {
    link.value = null;
}, {
    deep: true
})


const submit = () => {
    axios.post('/api/v1/company/users/invite', {
        company: userData.company.id,
        until: data.until,
        number_of_invitations: data.number_of_invitations,
        role: data.role
    }).then(res => {
        link.value = res.data
        emit('update:list')
    })
}

const modalClosed = () => {
    data.until = null;
    data.number_of_invitations = null;
    link.value = null;
}
</script>

<template>
    <Modal @closed="modalClosed">
        <template #button>
            <Button size="sm">Invite Users</Button>
        </template>
        <template #header>
            Invite users
        </template>
        <template #body>
            <form @submit.prevent="submit" class="space-y-4">
                <div>
                    <Label>Duration</Label>
                    <DatePicker v-model="data.until" />
                </div>
                <div>
                    <Label>Number of available slots</Label>
                    <Text v-model="data.number_of_invitations" />
                </div>
                <div>
                    <Label>Default role</Label>
                    <UiSelect v-model="data.role">
                        <option value="">Select a role...</option>
                        <option
                            v-for="obj in role.roles"
                            :key="obj.id"
                            :value="obj.id"
                        >
                            {{ obj.title }}
                        </option>
                    </UiSelect>
                </div>
            </form>

            <div
                v-if="link"
                @click="addToClipboard"
                class="mt-4 p-3 rounded-lg cursor-pointer transition-colors"
                :class="
                    showToast === 'success'
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                "
            >
                <p v-if="showToast === 'success'" class="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                    Link copied!
                </p>
                <p v-else class="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">
                    Click to copy
                </p>
                <p class="text-xs text-gray-600 dark:text-gray-400 break-all">{{ link }}</p>
            </div>
        </template>
        <template #footer>
            <Button @click="submit">Generate</Button>
        </template>
    </Modal>
</template>
