import {defineStore} from "pinia";
import {computed, reactive, ref, watch} from "vue";
import {DateTime} from "luxon";
import {useErrorsStore} from "./errors.js";

export const useCalendarStore =
    defineStore('calendarStore', () => {
        const calendar = ref([]);
        const isModalVisible = ref(false);
        const selectedYear = ref(DateTime.now().year);
        const selectedMonth = ref(DateTime.now().set({year: selectedYear.value}).month);
        const errorsStore = useErrorsStore();
        const showAdvancedSettings = ref(false);
        const videoCall = ref({});
        const byDay = [
            {
                'value': 'MO',
                'label': 'Monday'
            },
            {
                'value': 'TU',
                'label': 'Tuesday'
            },
            {
                'value': 'WE',
                'label': 'Wednesday'
            },
            {
                'value': 'TH',
                'label': 'Thursday'
            },
            {
                'value': 'FR',
                'label': 'Friday'
            },
            {
                'value': 'SA',
                'label': 'Saturday'
            },
            {
                'value': 'SU',
                'label': 'Sunday'
            },
        ]
        const form = reactive({
            summary: null,
            description: null,
            start_time: null,
            end_time: null,
            id: null,
            freq_until: null,
            has_video: false,
            type: 'event',
            freq: null,
            user_id: null,
            freq_settings: {},
            users: []
        });

        watch([selectedMonth, selectedYear], () => {

            load()
        }, {
            deep: true
        });

        const currentDate = computed(() => {
            return DateTime.now().set({year: selectedYear.value, month: selectedMonth.value})
        })

        const load = () => {
            errorsStore.setErrors([], '')
            calendar.value = [];
            axios.get('/api/v1/calendar', {
                params: {
                    year: selectedYear.value,
                    month: selectedMonth.value
                }
            }).then((response) => {
                response.data.data.forEach((obj) => {
                    calendar.value.push(getRepeatingEventData(obj))
                })
            });
        }

        const save = async () => {
            let request;
            const data = Object.assign({}, form);
            if (form.freq === 'WEEKLY') {
                console.log('its weekly')
                data.freq_settings = Object.keys(form.freq_settings).join(',')
            }
            if (form.freq === 'DAILY') {
                delete data.freq_settings;
            }

            if (!form.freq) {
                delete data.freq_settings;
                delete data.freq;
                delete data.freq_until;
            }

            data.users = data.users.map(obj => obj.id);

            if (form.id) {
                request = axios.put(`/api/v1/calendar/${form.id}`, data)
            } else {
                request = axios.post(`/api/v1/calendar`, data);
            }
            errorsStore.setErrors([], '')
            await request.then(() => {
                closeModal();
                load();
            }).catch((error) => {
                if (error.response.status === 422) {
                    errorsStore.setErrors(error.response.data.errors, '')
                }
            });
        }

        const closeModal = () => {
            form.summary = null;
            form.description = null;
            form.start_time = null;
            form.end_time = null;
            form.id = null;
            form.has_video = false;
            videoCall.value = {};
            isModalVisible.value = false;
        }

        const setItem = (obj) => {
            form.description = obj.description
            form.summary = obj.summary
            form.end_time = obj.end_time
            form.start_time = obj.start_time
            form.type = obj.type;
            form.freq_settings = obj.freq_settings;
            form.freq_until = obj.freq_until
            form.freq = obj.freq
            form.id = obj.id
            form.user_id = obj.user_id;
            form.has_video = !!obj.videocall;
            form.users = obj.attendance;
            videoCall.value = obj.videocall;

            if(obj.freq){
                showAdvancedSettings.value = true;
            }
        }

        const getRepeatingEventData = (obj) => {
            const start_date = DateTime.fromISO(obj.start_time);
            const end_date = DateTime.fromISO(obj.freq_until ?? obj.end_time);

            const startOfTheMonth = DateTime.now().set({
                'year': selectedYear.value,
                'month': selectedMonth.value
            }).startOf('month').startOf('day');

            const differenceInDays = Math.ceil(start_date.startOf('day').diff(startOfTheMonth, ['days']).toObject().days);


            const item = {
                ...obj,
                has_video: !!obj.videocalls,
                dates: []
            }

            for (let i = 1; i <= currentDate.value.endOf('month').day; i++) {
                const currentDay = currentDate.value.set({day: i}).toUTC().startOf('day');
                if (obj.freq === 'WEEKLY' && obj.freq_settings.indexOf(byDay[currentDay.weekday - 1].value) === -1) {
                    continue;
                }
                if (i > differenceInDays && end_date.toUTC().startOf('day').diff(currentDay, ['days']).days >= 0) {

                    item.dates.push(i);
                }
            }
            return item;
        }

        const deleteEvent = () => {
            axios.delete(`/api/v1/calendar/${form.id}`).then(() => {
                isModalVisible.value = false;
                closeModal();
                load();
            })
        }
        return {
            currentDate,
            selectedMonth,
            selectedYear,
            calendar,
            form,
            isModalVisible,
            videoCall,
            byDay,
            showAdvancedSettings,
            load,
            setItem,
            save,
            closeModal,
            deleteEvent
        }
    });
