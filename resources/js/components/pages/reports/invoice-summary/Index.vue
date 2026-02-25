<script setup>
import Auth from '@/components/layouts/Auth.vue'
import Card from '@/components/shared/Card.vue'
import Badge from '@/components/shared/ui/Badge.vue'
import UiSelect from '@/components/shared/ui/Select.vue'
import Label from '@/components/shared/Label.vue'
import DatePicker from '@/components/shared/DatePicker.vue'
import TabNav from '../partials/TabNav.vue'
import { useBreadcrumbStore } from '@/store/breadcrumb'
import { ref, reactive, watch, onMounted } from 'vue'

const breadcrumb = useBreadcrumbStore()

const customers = ref([])
const totals = ref({})
const customerOptions = ref([])
const loading = ref(false)

const filters = reactive({
    company_id: '',
    date_from: '',
    date_to: '',
})

const load = () => {
    loading.value = true
    const params = {}
    if (filters.company_id) params.company_id = filters.company_id
    if (filters.date_from) params.date_from = filters.date_from
    if (filters.date_to) params.date_to = filters.date_to

    window.axios
        .get('/api/v1/reports/invoice-summary', { params })
        .then((res) => {
            customers.value = res.data.data
            totals.value = res.data.totals
        })
        .finally(() => {
            loading.value = false
        })
}

const loadCustomers = () => {
    window.axios.get('/api/v1/customers').then((res) => {
        customerOptions.value = res.data.data ?? res.data
    })
}

watch(() => filters.company_id, () => load())
watch(() => filters.date_from, () => load())
watch(() => filters.date_to, () => load())

const formatCurrency = (amount) => {
    if (amount == null) return '-'
    return parseFloat(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}

const rateColor = (rate) => {
    if (rate >= 75) return 'green'
    if (rate >= 50) return 'yellow'
    return 'red'
}

onMounted(() => {
    load()
    loadCustomers()
    breadcrumb.setLinks([
        { link: '/', title: 'Home' },
        { title: 'Reports' },
    ])
})
</script>

<template>
    <Auth>
        <div class="flex items-center justify-between mb-2">
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">Reports</h1>
        </div>

        <TabNav />

        <!-- Filters -->
        <Card class="mb-4">
            <div class="flex flex-wrap items-end gap-3 p-4">
                <div class="min-w-[160px]">
                    <Label forInput="customer">Customer</Label>
                    <UiSelect v-model="filters.company_id">
                        <option value="">All Customers</option>
                        <option
                            v-for="customer in customerOptions"
                            :key="customer.id"
                            :value="customer.id"
                        >
                            {{ customer.name }}
                        </option>
                    </UiSelect>
                </div>

                <div class="min-w-[150px]">
                    <Label forInput="date_from">From</Label>
                    <DatePicker v-model="filters.date_from" name="date_from" />
                </div>

                <div class="min-w-[150px]">
                    <Label forInput="date_to">To</Label>
                    <DatePicker v-model="filters.date_to" name="date_to" />
                </div>
            </div>
        </Card>

        <!-- Table -->
        <Card>
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left" v-if="customers.length">
                    <thead class="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 uppercase">
                        <tr>
                            <th class="px-4 py-3">Customer</th>
                            <th class="px-4 py-3 text-right">Invoices</th>
                            <th class="px-4 py-3 text-right">Total Invoiced</th>
                            <th class="px-4 py-3 text-right">Total Paid</th>
                            <th class="px-4 py-3 text-right">Outstanding</th>
                            <th class="px-4 py-3 text-right">Payment Rate</th>
                        </tr>
                    </thead>
                    <tbody class="text-gray-700 dark:text-gray-300">
                        <tr
                            v-for="customer in customers"
                            :key="customer.id"
                            class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                            <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">{{ customer.name }}</td>
                            <td class="px-4 py-3 text-right font-mono">{{ customer.invoices_count }}</td>
                            <td class="px-4 py-3 text-right font-mono">{{ formatCurrency(customer.total_invoiced) }}</td>
                            <td class="px-4 py-3 text-right font-mono">{{ formatCurrency(customer.total_paid) }}</td>
                            <td class="px-4 py-3 text-right font-mono">{{ formatCurrency(customer.outstanding) }}</td>
                            <td class="px-4 py-3 text-right">
                                <Badge :color="rateColor(customer.payment_rate)">{{ customer.payment_rate }}%</Badge>
                            </td>
                        </tr>
                    </tbody>
                    <tfoot class="bg-gray-50 dark:bg-gray-800 font-medium text-gray-900 dark:text-white">
                        <tr>
                            <td class="px-4 py-3">Totals</td>
                            <td class="px-4 py-3 text-right font-mono">{{ totals.invoices_count }}</td>
                            <td class="px-4 py-3 text-right font-mono">{{ formatCurrency(totals.total_invoiced) }}</td>
                            <td class="px-4 py-3 text-right font-mono">{{ formatCurrency(totals.total_paid) }}</td>
                            <td class="px-4 py-3 text-right font-mono">{{ formatCurrency(totals.outstanding) }}</td>
                            <td class="px-4 py-3 text-right">
                                <Badge :color="rateColor(totals.payment_rate)">{{ totals.payment_rate }}%</Badge>
                            </td>
                        </tr>
                    </tfoot>
                </table>

                <!-- Empty state -->
                <div
                    v-else-if="!loading"
                    class="flex flex-col items-center justify-center py-24 text-center"
                >
                    <svg class="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                            d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                    </svg>
                    <p class="text-sm font-medium text-gray-500 dark:text-gray-400">No invoice data found</p>
                    <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Try adjusting your filters</p>
                </div>

                <!-- Loading -->
                <div v-if="loading" class="flex items-center justify-center py-12">
                    <svg class="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                </div>
            </div>
        </Card>
    </Auth>
</template>
