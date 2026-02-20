<script setup>
import { onMounted, ref, computed } from 'vue'
import { DateTime } from 'luxon'
import { useRouter } from 'vue-router'
import { useCalendarStore } from '@/store/calendarStore'
import Card from '@/components/shared/Card.vue'
import Button from '@/components/shared/Button.vue'
import Modal from '@/components/shared/Modal.vue'
import Form from './calendar/Form.vue'
import PlusSquare from '@/components/shared/icons/PlusSquare.vue'
import ArrowLeft from '@/components/shared/icons/ArrowLeft.vue'
import ArrowRight from '@/components/shared/icons/ArrowRight.vue'
import InfoIcon from '@/components/shared/icons/InfoIcon.vue'
import { useUserStore } from '@/store/user'
import CalendarDetails from './calendar/Details.vue'

const showInfoModal = ref(false)
const calendar = useCalendarStore()
const userStore = useUserStore()
const router = useRouter()

onMounted(() => {
  calendar.load()
  goToToday()
  window.Echo.private(`event.${userStore.user.id}`).listen(
    'CalendarEventUpdatedEvent',
    () => { calendar.load() }
  )
})

const location = window.location.href

const selectedWeek = ref(0)
const selectedDay = ref(null)

const weekRanges = computed(() => {
  const numDays = calendar.currentDate.endOf('month').day
  const firstWeekday = calendar.currentDate.startOf('month').weekday - 1
  const totalDays = numDays + firstWeekday
  const weekCount = Math.ceil(totalDays / 7)

  const weeks = []
  for (let i = 0; i < weekCount; i++) {
    weeks.push({
      start: i * 7 + 1 - firstWeekday,
      end: Math.min((i + 1) * 7 - firstWeekday, numDays)
    })
  }
  return weeks
})

const currentWeekDays = computed(() => {
  if (selectedWeek.value >= weekRanges.value.length) {
    selectedWeek.value = 0
  }
  const currentWeek = weekRanges.value[selectedWeek.value]
  const days = []
  if (selectedWeek.value === 0) {
    const firstWeekday = calendar.currentDate.startOf('month').weekday - 1
    for (let i = 0; i < firstWeekday; i++) { days.push(null) }
  }
  for (let day = Math.max(1, currentWeek.start); day <= currentWeek.end; day++) {
    days.push(day)
  }
  return days
})

const selectDay = (day) => {
  selectedDay.value = day === selectedDay.value ? null : day
}

const selectedDayEvents = computed(() => {
  if (!selectedDay.value) return []
  return calendar.calendar.filter((obj) => obj.dates.indexOf(selectedDay.value) > -1)
})

const nextWeek = () => {
  if (selectedWeek.value < weekRanges.value.length - 1) {
    selectedWeek.value++
    selectedDay.value = null
  }
}

const prevWeek = () => {
  if (selectedWeek.value > 0) {
    selectedWeek.value--
    selectedDay.value = null
  }
}

const goToToday = () => {
  const today = calendar.goToToday()
  for (let i = 0; i < weekRanges.value.length; i++) {
    const week = weekRanges.value[i]
    if (today >= week.start && today <= week.end) {
      selectedWeek.value = i
      break
    }
  }
  selectedDay.value = today
}

const currentRoute = router.currentRoute.value

const openEvent = (eventId) => {
  router.push({ query: { ...currentRoute.query, event: eventId.toString() } })
}

const createNewEvent = () => {
  router.push({ path: currentRoute.path, query: { ...currentRoute.query, createNewEvent: 'true' } })
}

const eventBadgeClass = (event) => {
  if (event.type === 'event' && event.user_id !== userStore.user.id)
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  if (event.type === 'event')
    return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  if (event.approved)
    return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
  return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
}
</script>

<template>
  <Card>
    <!-- Header -->
    <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
      <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Calendar</h3>
    </div>

    <div class="px-4 py-3 flex flex-col gap-3">
      <!-- Date controls -->
      <div class="flex flex-wrap gap-2 items-center justify-between">
        <!-- Month select -->
        <select
          :value="calendar.selectedMonth"
          @change="calendar.selectedMonth = +$event.target.value"
          class="text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        >
          <option
            v-for="m in 12"
            :key="m"
            :value="DateTime.now().startOf('year').plus({ month: m - 1 }).month"
          >
            {{ DateTime.now().startOf('year').plus({ month: m - 1 }).toLocaleString({ month: 'long' }) }}
          </option>
        </select>

        <!-- Year navigation -->
        <div class="flex items-center gap-2">
          <Button variant="soft" size="sm" @click="calendar.selectedYear = DateTime.now().set({ year: calendar.selectedYear - 1 }).year">
            <ArrowLeft class="w-3 h-3" />
          </Button>
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[3rem] text-center">{{ calendar.selectedYear }}</span>
          <Button variant="soft" size="sm" @click="calendar.selectedYear = DateTime.now().set({ year: calendar.selectedYear + 1 }).year">
            <ArrowRight class="w-3 h-3" />
          </Button>
        </div>

        <!-- Action buttons -->
        <div class="flex items-center gap-1 ml-auto">
          <Button variant="primary" size="sm" @click="goToToday">Today</Button>
          <Button variant="soft" size="sm" @click="createNewEvent">
            <PlusSquare class="w-4 h-4" />
          </Button>
          <Button variant="soft" size="sm" @click="showInfoModal = true">
            <InfoIcon class="w-4 h-4" />
          </Button>
        </div>
      </div>

      <!-- Week navigation -->
      <div class="flex justify-between items-center">
        <Button variant="ghost" size="sm" :disabled="selectedWeek === 0" @click="prevWeek">
          <ArrowLeft class="w-3 h-3" />
        </Button>
        <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">
          Week {{ selectedWeek + 1 }} of {{ weekRanges.length }}
        </span>
        <Button variant="ghost" size="sm" :disabled="selectedWeek === weekRanges.length - 1" @click="nextWeek">
          <ArrowRight class="w-3 h-3" />
        </Button>
      </div>

      <!-- Week grid -->
      <div class="grid grid-cols-7 text-xs">
        <!-- Day headers -->
        <div
          v-for="day in 7"
          :key="`hdr-${day}`"
          class="py-1 text-center font-medium text-gray-400 dark:text-gray-500"
        >
          {{ DateTime.now().startOf('week').plus({ day: day - 1 }).toFormat('ccc')[0] }}
        </div>

        <!-- Day cells -->
        <template v-for="(day, index) in currentWeekDays" :key="`day-${index}`">
          <div v-if="day === null" class="bg-gray-50 dark:bg-gray-800/30 min-h-[44px]" />
          <div
            v-else
            @click="selectDay(day)"
            :class="[
              'cursor-pointer border border-transparent min-h-[44px] p-1.5 flex flex-col items-center gap-1 rounded-lg transition-colors',
              selectedDay === day
                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
              DateTime.now().set({ year: calendar.selectedYear, month: calendar.selectedMonth, day }).startOf('day').diff(DateTime.now().startOf('day'), ['days']).toObject().days === 0
                ? 'font-bold text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300'
            ]"
          >
            <span>{{ day }}</span>
            <span
              v-if="calendar.calendar.filter(obj => obj.dates.indexOf(day) > -1).length > 0"
              class="w-1.5 h-1.5 rounded-full bg-blue-500"
            />
          </div>
        </template>
      </div>

      <!-- Selected day events -->
      <div v-if="selectedDay" class="border-t border-gray-100 dark:border-gray-800 pt-3">
        <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
          {{
            DateTime.now()
              .set({ year: calendar.selectedYear, month: calendar.selectedMonth, day: selectedDay })
              .toFormat('LLL d, yyyy')
          }}
        </p>

        <p v-if="selectedDayEvents.length === 0" class="text-sm text-gray-400 dark:text-gray-500">
          No events scheduled
        </p>

        <div v-else class="flex flex-col gap-2">
          <div
            v-for="event in selectedDayEvents.sort((a, b) => new Date(a.start_time) - new Date(b.start_time))"
            :key="`event-${event.id}`"
            class="border border-gray-100 dark:border-gray-800 rounded-lg p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
            @click="openEvent(event.id)"
          >
            <div class="flex justify-between items-center mb-1">
              <span :class="['inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium', eventBadgeClass(event)]">
                {{ event.type === 'event' ? 'Event' : 'Task' }}
              </span>
              <span class="text-xs text-gray-400">{{ DateTime.fromISO(event.start_time).toFormat('h:mm a') }}</span>
            </div>
            <p class="text-sm font-medium text-gray-800 dark:text-white">{{ event.summary }}</p>
            <p v-if="event.description" class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
              {{ event.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </Card>

  <Form v-if="calendar.showEditForm" />
  <CalendarDetails v-if="calendar.showCalendarDetails" />

  <Modal :hideModal="showInfoModal" @closed="showInfoModal = false">
    <template #header>Subscribe to calendar</template>
    <template #body>
      <div class="flex flex-col gap-2 text-sm">
        <div><span class="text-gray-500">Address:</span> <strong>{{ location }}calendar</strong></div>
        <div><span class="text-gray-500">Username:</span> <strong>{{ userStore.user.email }}</strong></div>
        <div><span class="text-gray-500">Password:</span> <strong>your password</strong></div>
        <p class="text-gray-500 text-xs mt-2">
          Check online for how to subscribe to a CalDAV calendar with basic authentication.<br />
          <strong>Android:</strong> Use ICSx⁵ or similar.<br />
          <strong>macOS/iOS:</strong> Open Calendar → subscribe to calendars.
        </p>
      </div>
    </template>
  </Modal>
</template>
