<script setup lang="ts">

import Label from "../../../../../../shared/Label.vue";
import DatePicker from "../../../../../../shared/DatePicker.vue";
import {FwbAccordion, FwbAccordionPanel, FwbButton} from "flowbite-vue";
import {onMounted, reactive, ref} from "vue";
import {useRoute} from "vue-router";
import _ from "lodash";
import UserTimeSheet from "./UserTimeSheet.vue";

const model = ref({});

const route = useRoute();
const props = defineProps({
    taskId: null
})
const form = reactive({
    start: null,
    end: null,
    task_id: props.taskId
})
const submit = () => {
    axios.post('/api/v1/time-sheet', {...form, project_id: route.params.project}).then(() => load())
}
const load = () => {
    axios.get('/api/v1/time-sheet', {
        params: {
            project_id: route.params.project,
            task_id: props.taskId
        }
    }).then(res => model.value = _.groupBy(res.data, 'user_id'))
}
onMounted(() => {
    load();
})
</script>

<template>
    <div>
        <form @submit.prevent="submit" class="flex gap-4 flex-col md:flex-row items-baseline mb-4">
            <div>
                <Label for-input="start">Start date and time</Label>
                <DatePicker v-model="form.start" enable-time="true"/>
            </div>
            <div>
                <Label for-input="end">End date and time</Label>
                <DatePicker v-model="form.end" enable-time="true"/>
            </div>
            <fwb-button class="mt-auto mb-1">
                Save
            </fwb-button>
        </form>
        <fwb-accordion :open-first-item="false" class="pb-10">
            <fwb-accordion-panel v-for="key in Object.keys(model)" :key="key">
                <UserTimeSheet :model="model[key]" @deleted="load"  />
            </fwb-accordion-panel>
        </fwb-accordion>
    </div>
</template>

<style scoped>

</style>
