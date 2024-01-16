<script setup lang="ts">

import {DateTime} from "luxon";
import {FwbAccordionContent, FwbAccordionHeader, FwbButton, FwbSelect} from "flowbite-vue";
import {computed, ref, watch} from "vue";
import _ from "lodash";
import TrashIcon from "../../../../../../shared/icons/TrashIcon.vue";
import InteractiveToast from "../../../../../../shared/InteractiveToast.vue";
import Label from "../../../../../../shared/Label.vue";

const groupBy = ref('yyyy LLL');
const selectedDay = ref(null);
const props = defineProps({
    model: []
})

const emit = defineEmits(['deleted'])

const groupingOptions = [
    {
        value: 'yyyy',
        name: 'Year'
    },
    {
        value: 'yyyy LLL',
        name: 'Month'
    },
    {
        value: 'yyyy LLL dd',
        name: 'Day'
    }
];

watch(() => props.model, () => {
    items.value = props.model;
})
const items = ref(props.model);
const data = computed(() => {
    return _.groupBy(items.value, function (obj) {
        return DateTime.fromISO(obj.start).toFormat(groupBy.value)
    })
})
const getDatesDropDown = computed(() => {
    return Object.keys(data.value).map(date => {
        return {
            value: date,
            name: date
        }
    });
})
const removeDate = ({id}) => {
    axios.delete(`/api/v1/time-sheet/${id}`).then(() => {
        _.remove(items.value, {"id": id});
        emit('deleted')
    })
}
</script>

<template >

    <fwb-accordion-header >{{ model[0]?.user.name }}</fwb-accordion-header>
    <fwb-accordion-content>
        <Label>Grouping options</Label>
        <fwb-select v-model="groupBy"
                    placement="Select grouping options"
                    :options="groupingOptions"
        />

        <div v-if="groupBy !== 'yyyy LLL dd'" v-for="key in Object.keys(data)">
            <div class="grid grid-cols-4 border-b">
                <div>Start time</div>
                <div>End time</div>
                <div>No. of hours</div>
            </div>
            <h3 class="flex justify-between border-b p-4 cursor-pointer">
                <span>
                {{ key }}
                </span>
                <span>

                {{
                        _.sumBy(data[key], function (obj) {
                            return Number(DateTime.fromISO(obj.end).diff(DateTime.fromISO(obj.start), ['hours']).hours)
                        }).toFixed(2)
                    }} h
            </span>
            </h3>
        </div>
        <template v-if="groupBy === 'yyyy LLL dd'" :key="model.length" >
            <Label>Select date</Label>
            <fwb-select
                v-if="groupBy === 'yyyy LLL dd'"
                v-model="selectedDay"
                placeholder="Select date"
                :options="getDatesDropDown"
            />
            <div class="grid grid-cols-4 border-b">
                <div>Start time</div>
                <div>End time</div>
                <div>No. of hours</div>
            </div>
            <div class="grid grid-cols-4 pl-4 border-b hover:bg-gray-100 hover:dark:bg-gray-700"
                 v-for="obj in data[selectedDay]">
                <div>
                    {{ DateTime.fromISO(obj.start).toLocaleString(DateTime.DATETIME_MED) }}
                </div>
                <div>
                    {{ DateTime.fromISO(obj.end).toLocaleString(DateTime.DATETIME_MED) }}
                </div>
                <div>
                    {{
                        Number(DateTime.fromISO(obj.end).diff(DateTime.fromISO(obj.start), ['hours']).hours).toFixed(2)
                    }} h
                </div>
                <div class="flex justify-end">
                    <InteractiveToast>
                        <template #trigger>
                            <fwb-button color="red" size="xs" class="ml-auto m-2">
                                <TrashIcon class="w-2 h-2"/>
                            </fwb-button>
                        </template>
                        <template #title>
                            <h1>Are you sure?</h1>
                        </template>
                        <template #content>
                            You are about to delete {{
                                DateTime.fromISO(obj.start).toLocaleString(DateTime.DATETIME_MED)
                            }}
                            recored time?
                        </template>
                        <template #actions>
                            <fwb-button @click="() => removeDate(obj)" size="xs">Yes delete it</fwb-button>
                        </template>
                    </InteractiveToast>
                </div>
            </div>

            <div class="grid grid-cols-4 border-b font-bold">
                <div>Total</div>
                <div></div>
                <div></div>
                <div class="flex justify-end">
                    {{
                        _.sumBy(data[selectedDay], function (obj) {
                            return Number(DateTime.fromISO(obj.end).diff(DateTime.fromISO(obj.start), ['hours']).hours)
                        }).toFixed(2)
                    }} h
                </div>
            </div>
        </template>

    </fwb-accordion-content>
</template>

<style scoped>

</style>
