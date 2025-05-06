<script setup>
// Import the Pivot component and CSS styles
import { ref, markRaw } from 'vue'
import { DateTime } from 'luxon'
import Auth from '../../layouts/Auth.vue'
import { VuePivottableUi, Renderer } from 'vue-pivottable'
import PlotlyRenderer from '@vue-pivottable/plotly-renderer'
import 'vue-pivottable/dist/vue-pivottable.css'

const data = ref([])
const loading = ref(false)
const load = () => {
  loading.value = true
  axios
    .get('/api/v1/report', { params: { type: 'timesheet' } })
    .then(
      res =>
        (data.value = res.data.data.map(obj => {
          const endTime = DateTime.fromISO(obj.end_time)
          const diffTime = DateTime.fromISO(obj.start_time)
          const diff = endTime.diff(diffTime, ['hours']).toObject()
          return {
            title: obj.title,
            date: diffTime.toLocaleString(DateTime.DATE_SHORT),
            user_name: obj.user.name,
            total_time: Math.abs(diff.hours ?? 0),
          }
        })),
    )
    .then(() => (loading.value = false))
}

// add plotly renderer to default renderer
const renderers = markRaw({
  ...Renderer,
  ...PlotlyRenderer,
})

load()
</script>
<template>
  <Auth>
    <template v-if="!loading">
      <VuePivottableUi
        :data="data"
        :rows="[]"
        :cols="[]"
        :renderers="renderers"
      />
    </template>
  </Auth>
</template>
