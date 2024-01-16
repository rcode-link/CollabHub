<script setup>

import Card from "../../../shared/Card.vue";
import {onMounted} from "vue";
import {DateTime} from "luxon";
import WeekDay from "./calendar/WeekDay.vue";
import {FwbButton, FwbButtonGroup, FwbDropdown, FwbListGroup, FwbListGroupItem} from "flowbite-vue";
import {useCalendarStore} from "../../../../store/calendarStore.js";
import Form from "./calendar/Form.vue";
import PlusSquare from "../../../shared/icons/PlusSquare.vue";
import ArrowLeft from "../../../shared/icons/ArrowLeft.vue";
import ArrowRight from "../../../shared/icons/ArrowRight.vue";
import {Tippy} from "vue-tippy";
import InfoIcon from "../../../shared/icons/InfoIcon.vue";
import {useUserStore} from "../../../../store/user.js";
import Modal from "../../../shared/Modal.vue";
import Header from "../../chat/partials/messages/Header.vue";

const calendar = useCalendarStore();
const userStore = useUserStore();
onMounted(() => {
    calendar.load();
})

const location = window.location.href;

</script>

<template>
    <Card class="flex-col">
        <div class="flex gap-4 z-20 items-center">
            <fwb-dropdown :text="calendar.currentDate.toLocaleString({ month: 'long'})">
                <fwb-list-group>
                    <fwb-list-group-item class="cursor-pointer" v-for="month in 12"
                                         @click="calendar.selectedMonth =  DateTime.now().startOf('year').plus({month: month - 1}).month">
                        {{ DateTime.now().startOf('year').plus({month: month - 1}).toLocaleString({month: 'long'}) }}
                    </fwb-list-group-item>
                </fwb-list-group>
            </fwb-dropdown>
            <div class="flex gap-4 items-center">
                <fwb-button  color="alternative" @click="calendar.selectedYear =  DateTime.now().set({year:calendar.selectedYear - 1}).year">
                    <ArrowLeft class="w-4 h-4"/>
                </fwb-button>
                <div>{{ calendar.selectedYear }}</div>
                <fwb-button color="alternative" @click="calendar.selectedYear =  DateTime.now().set({year:calendar.selectedYear+ 1}).year">
                    <ArrowRight class="w-4 h-4"/>
                </fwb-button>
            </div>
            <fwb-button color="alternative" class="ml-auto" @click="calendar.isModalVisible = true">
                <PlusSquare class="w-4 h-4"/>
            </fwb-button>
            <Modal>
                <template #button>
                    <InfoIcon class="w-6 h-6"/>
                </template>
                <template #header>
                    <h1 class='text-lg'>Subscribe to calendar</h1>
                </template>
                <template #body>
                    Address: <b>{{ location }}calendar </b>
                    <br/> username: <b>{{ userStore.user.email }}</b>
                    <br/> password: <b>your password</b>
                    <h2>Note</h2>
                    <p>
                        Check on the internet how you can subscribe to calendar with base base authentication.
                    </p>
                    <h4>
                        For android:
                    </h4>
                    <p>
                        Use ICSx5 or some similar app
                    </p>
                    <h4>
                        For MacOS/iOS:
                    </h4>
                    <p>
                        Open calendar click on calendars and subscribe to calendars
                    </p>

                </template>
            </Modal>
        </div>
        <div class="grid grid-cols-7 w-full">
            <div v-for="day in 7">
                {{ DateTime.now().startOf('week').plus({day: day - 1}).toFormat('EEE') }}
            </div>

            <div v-for="n in calendar.currentDate.startOf('month').weekday - 1"/>
            <WeekDay v-for="n in calendar.currentDate.endOf('month').day" :day="n"
                     :isToday=" DateTime.now().set({year: calendar.selectedYear, month: calendar.selectedMonth, day: n}).startOf('day').diff(DateTime.now().startOf('day'),['days']).toObject().days === 0"
                     :events="calendar.calendar.filter(obj => obj.dates.indexOf(n) > -1)"/>
        </div>
    </Card>
    <Form/>
</template>

<style scoped>

</style>
