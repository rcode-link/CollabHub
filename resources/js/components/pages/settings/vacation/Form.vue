<script setup lang="js">
import { ref, watch } from "vue";
import Modal from "@/components/shared/Modal.vue";
import Button from "@/components/shared/Button.vue";
import Label from "@/components/shared/Label.vue";
import Text from "@/components/shared/Text.vue";
import Errors from "@/components/shared/Errors.vue";
import { useVacationGroupStore } from "@/store/vacationGroupStore";

const props = defineProps({
    group: { type: Object, default: null },
});

const emit = defineEmits(["update"]);
const store = useVacationGroupStore();
const modalRef = ref();

const emptyForm = () => ({
    name: "",
    days_per_year: 0,
    period_start: "",
    period_end: "",
});

const model = ref(emptyForm());

watch(
    () => props.group,
    (g) => {
        if (g) {
            model.value = {
                name: g.name,
                days_per_year: g.days_per_year,
                period_start: g.period_start,
                period_end: g.period_end,
            };
        }
    },
    { immediate: true }
);

const closed = () => {
    model.value = emptyForm();
};

const save = async () => {
    try {
        if (props.group?.id) {
            await store.updateGroup(props.group.id, model.value);
        } else {
            await store.createGroup(model.value);
        }
        emit("update");
        modalRef.value.closeModal();
    } catch (e) {
        // validation errors handled by Errors component
    }
};
</script>
<template>
    <Modal ref="modalRef" @closed="closed">
        <template #button>
            <Button size="sm">
                {{ group ? "Edit" : "Add vacation group" }}
            </Button>
        </template>
        <template #header>
            {{ group ? "Edit vacation group" : "Add vacation group" }}
        </template>
        <template #body>
            <form @submit.prevent="save" class="space-y-4">
                <div>
                    <Label for-input="name">Name</Label>
                    <Text name="name" v-model="model.name" />
                    <Errors name="name" />
                </div>
                <div>
                    <Label for-input="days_per_year">Days per year</Label>
                    <Text
                        name="days_per_year"
                        type="number"
                        v-model="model.days_per_year"
                    />
                    <Errors name="days_per_year" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <Label for-input="period_start">Period start</Label>
                        <Text
                            name="period_start"
                            type="date"
                            v-model="model.period_start"
                        />
                        <Errors name="period_start" />
                    </div>
                    <div>
                        <Label for-input="period_end">Period end</Label>
                        <Text
                            name="period_end"
                            type="date"
                            v-model="model.period_end"
                        />
                        <Errors name="period_end" />
                    </div>
                </div>
            </form>
        </template>
        <template #footer>
            <Button @click="save">Save</Button>
        </template>
    </Modal>
</template>
