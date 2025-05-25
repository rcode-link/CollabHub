<script setup>
// Import the Pivot component and CSS styles
import { ref, markRaw } from 'vue'
import { DateTime } from 'luxon'
import { FwbCard } from 'flowbite-vue'
import Auth from '../../layouts/Auth.vue'
import { VuePivottableUi, Renderer } from 'vue-pivottable'
import PlotlyRenderer from '@quantify/vue3-pivottable-plotly-renderer'

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
                    user: obj.user.name,
                    time: Math.abs(diff.hours ?? 0),
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
            <div class="bg-white p-2 shadow-md rounded">
                <VuePivottableUi :data="data" :rows="[]" :cols="[]" :renderers="renderers" />
            </div>
        </template>
    </Auth>
</template>

<style>
.pvtUi .pvtHorizList {}

.pvtRenderers {
    width: 30%;
}

.pvtUi {
    @apply w-full;
}

.pvtAxisContainer,
.pvtVals,
.pvtRenderers {
    height: 100%;
    background: white;
}

.pvtRows {}

.pvtHorizList.pvtCols {
    position: relative;
}

.pvtUi li {
    list-style: none;
}

.pvtUi td.pvtRenderers,
td.pvtVals {
    border-right: 1rem solid white;
}

.pvtUi select,
.pvtUi input {
    @apply bg-gray-50 mb-2 me-2 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500;
}

.pvtUi .pvtRowOrder,
.pvtUi .pvtColOrder {
    display: inline-flex;

    @apply my-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800;
}

.pvtHorizList>li {
    display: contents;
}

.pvtFilterBox {
    position: absolute;
    @apply top-10 left-0 w-64 shadow-lg rounded bg-white p-2;
}

.pvtSearchContainer .pvtButton {
    @apply inline-flex my-2 me-2 px-3 py-2 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800;
}

.pvtCheckContainer>p>.pvtOnly {
    @apply ml-auto cursor-pointer;
}

.pvtCheckContainer>p {
    @apply flex items-center mb-4 cursor-pointer;
}

.pvtCheckContainer>p input {
    @apply w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600;
}

.pvtOutput {
    @apply overflow-auto ps-2;
}

.pvtOutput table>thead {
    @apply text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400;
}

.pvtOutput table tbody>tr {
    @apply odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200;
}

.pvtOutput table {
    @apply w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400;
}

.pvtAttr {
    position: relative;
    border-radius: 2rem;
    @apply inline-flex cursor-move items-center bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-blue-400 border border-blue-400;
}

.pvtAttr>.pvtTriangle {
    @apply cursor-default relative text-gray-100;
}

.pvtRenderers::before {
    content: 'Present data as:';
}

.pvtVals {
    border-bottom: 1rem solid white;
}

.pvtVals::before {
    content: 'Aggragate data:';
}

.pvtUnused::before {
    content: 'Unused variables:';
    position: absolute;
    top: 0;
    left: 0;
}

.pvtRows::before {
    content: 'Rows:';
    position: absolute;
    transform: translateY(-100%);
    top: 0;
    left: 0;
}

.pvtCols::before {
    content: 'Columns:';
    position: absolute;
    transform: translateY(-100%);
    top: 0;
    left: 0;
}

.pvtAttr>.pvtTriangle::after {
    content: '';
    @apply opacity-100 text-gray-800 text-lg;
}

.pvtVertList.pvtRows,
.pvtCols,
.pvtUnused {
    position: relative;
}

.pvtUnused {
    border-bottom: 1rem solid white;
}

.pvtHorizList.pvtCols,
.pvtVertList.pvtRows {
    @apply flex items-start p-2 justify-center w-full min-h-12 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600;
}

.pvtHorizList.pvtCols {
    @apply justify-start;
}

.pvtVertList.pvtRows {
    @apply flex-col space-y-2;
}
</style>
