import { defineStore } from "pinia";
import { computed, reactive, ref, watch } from "vue";
import { DateTime } from "luxon";
import { useErrorsStore } from "./errors.js";
import { useRoute, useRouter } from "vue-router";

export const useCalendarStore = defineStore("calendarStore", () => {
  const calendar = ref([]);
  const isModalVisible = ref(false);
  const showDetails = ref(false);
  const selectedYear = ref(DateTime.now().year);
  const selectedMonth = ref(
    DateTime.now().set({ year: selectedYear.value }).month
  );
  const errorsStore = useErrorsStore();
  const route = useRoute();
  const router = useRouter();
  const showAdvancedSettings = ref(false);
  const videoCall = ref();

  const calendarItemType = [
    {
      value: "event",
      name: "Event",
    },
    {
      value: "vacation",
      name: "Vacation",
    },
  ];
  const freqSttingsBase = {
    MO: false,
    TU: false,
    WE: false,
    TH: false,
    FR: false,
    SA: false,
    SU: false,
  };
  const byDay = [
    {
      value: "MO",
      label: "Monday",
    },
    {
      value: "TU",
      label: "Tuesday",
    },
    {
      value: "WE",
      label: "Wednesday",
    },
    {
      value: "TH",
      label: "Thursday",
    },
    {
      value: "FR",
      label: "Friday",
    },
    {
      value: "SA",
      label: "Saturday",
    },
    {
      value: "SU",
      label: "Sunday",
    },
  ];
  const form = reactive({
    summary: "",
    description: "",
    start_time: "",
    end_time: "",
    id: null,
    freq_until: "",
    approved: false,
    has_video: false,
    type: "event",
    freq: "",
    user_id: null,
    freq_settings: freqSttingsBase,
    users: [],
  });

  watch(
    [selectedMonth, selectedYear],
    () => {
      load();
    },
    {
      deep: true,
    }
  );

  const currentDate = computed(() => {
    return DateTime.now().set({
      year: selectedYear.value,
      month: selectedMonth.value,
    });
  });

  const load = () => {
    errorsStore.setErrors([], "");
    calendar.value = [];
    window.axios
      .get("/api/v1/calendar", {
        params: {
          year: selectedYear.value,
          month: selectedMonth.value,
        },
      })
      .then((response) => {
        response.data.data.forEach((obj) => {
          calendar.value.push(getRepeatingEventData(obj));
        });
      });
  };

  const save = async () => {
    let request;
    const data = Object.assign({}, form);
    if (form.freq === "WEEKLY" && form.freq_settings) {
      data.freq_settings = Object.keys(form.freq_settings)
        //@ts-ignore
        .filter((key) => form.freq_settings[key] === true)
        .join(",");
    }

    if (form.type === "vacation") {
      form.freq = "DAILY";
    }

    if (form.freq === "DAILY" && form.freq_settings) {
      delete data.freq_settings;
    }

    if (!form.freq) {
      delete data.freq_settings;
      delete data.freq;
      delete data.freq_until;
    }

    const stTime = DateTime.fromISO(form.start_time);
    const endTime = DateTime.fromISO(form.end_time);
    data.end_time = stTime
      .set({
        hour: endTime.hour,
        minute: endTime.minute,
      })
      .toUTC()
      .toString();

    data.users = data.users.map((obj) => obj.id);

    if (form.id) {
      request = window.axios.put(`/api/v1/calendar/${form.id}`, data);
    } else {
      request = window.axios.post(`/api/v1/calendar`, data);
    }
    errorsStore.setErrors([], "");
    await request
      .then(() => {
        closeModal();
      })
      .catch((error) => {
        if (error.response.status === 422) {
          errorsStore.setErrors(error.response.data.errors, "");
        }
      });
  };

  const closeModal = () => {
    form.summary = "";
    form.description = null;
    form.start_time = "";
    form.end_time = "";
    form.id = null;
    form.has_video = false;
    videoCall.value = {
      slug: null,
    };
    isModalVisible.value = false;
    showAdvancedSettings.value = false;
    router.push({
      query: {
        event: route.query.event,
      },
    });
  };

  const setItem = (obj) => {
    const tmpFreq = freqSttingsBase;
    obj.freq_settings?.split(",").forEach((element) => {
      //@ts-ignore
      tmpFreq[element] = true;
    });

    form.description = obj.description;
    form.summary = obj.summary;
    form.end_time = obj.end_time;
    form.start_time = obj.start_time;
    form.type = obj.type;
    form.freq_settings = tmpFreq;
    form.freq_until = obj.freq_until;
    form.freq = obj.freq;
    form.id = obj.id;
    form.user_id = obj.user_id;
    form.has_video = !!obj.videocall;
    form.users = obj.attendance;
    videoCall.value = obj.videocall;

    if (obj.freq || obj.attendance.length > 0 || obj.description) {
      showAdvancedSettings.value = true;
    }
  };

  const getRepeatingEventData = (obj) => {
    const start_date = DateTime.fromISO(obj.start_time);
    const end_date = DateTime.fromISO(obj.freq_until ?? obj.end_time);
    const startOfTheMonth = DateTime.now()
      .set({
        year: selectedYear.value,
        month: selectedMonth.value,
      })
      .startOf("month")
      .startOf("day");

    const differenceInDays = Math.ceil(
      start_date.startOf("day").diff(startOfTheMonth, ["days"]).toObject()
        .days ?? 0
    );

    const item = {
      ...obj,
      has_video: !!obj.videocall,
      dates: [],
    };

    for (let i = 1; i <= currentDate.value.endOf("month").day; i++) {
      const currentDay = currentDate.value
        .set({ day: i })
        .toUTC()
        .startOf("day");
      if (
        obj.freq === "WEEKLY" &&
        obj.freq_settings?.indexOf(
          byDay[currentDay.weekday - 1].value
        ) === -1
      ) {
        continue;
      }
      if (
        i > differenceInDays &&
        end_date.toUTC().startOf("day").diff(currentDay, ["days"])
          .days >= 0
      ) {
        item.dates.push(i);
      }
    }
    return item;
  };

  const deleteEvent = () => {
    window.axios.delete(`/api/v1/calendar/${form.id}`).then(() => {
      isModalVisible.value = false;
      closeModal();
      load();
      router.push("/");
    });
  };

  const showCalendarDetails = computed(() => {
    const { edit, event } = route.query;
    if (edit) {
      return false;
    }

    return event && !edit;
  });

  const showEditForm = computed(() => {
    if (route.query.createNewEvent === "true") {
      return true;
    }

    return (
      route.query.edit === "true" &&
      route.query.event &&
      Number(route.query.event) > 0
    );
  });
  // Function to set calendar to current date (today)
  const goToToday = () => {
    const now = DateTime.now();
    selectedYear.value = now.year;
    selectedMonth.value = now.month;
    load();
    return now.day;
  };

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
    calendarItemType,
    showDetails,
    showCalendarDetails,
    showEditForm,
    load,
    setItem,
    save,
    closeModal,
    deleteEvent,
    goToToday,
  };
});
