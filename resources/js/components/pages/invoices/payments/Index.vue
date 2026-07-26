<script setup>
import Auth from '@/components/layouts/Auth.vue'
import Card from '@/components/shared/Card.vue'
import Button from '@/components/shared/Button.vue'
import UiSelect from '@/components/shared/ui/Select.vue'
import Text from '@/components/shared/Text.vue'
import Modal from '@/components/shared/Modal.vue'
import Label from '@/components/shared/Label.vue'
import DatePicker from '@/components/shared/DatePicker.vue'
import InteractiveToast from '@/components/shared/InteractiveToast.vue'
import TabNav from '../partials/TabNav.vue'
import { TailwindPagination } from 'laravel-vue-pagination'
import { useBreadcrumbStore } from '@/store/breadcrumb'
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { DateTime } from 'luxon'

const breadcrumb = useBreadcrumbStore()

const payments = ref({ data: [] })
const customers = ref([])
const invoices = ref([])
const loading = ref(false)
const modalRef = ref()
const saving = ref(false)

const filters = reactive({
  company_id: '',
  date_from: '',
  date_to: '',
})

const newPayment = reactive({
  invoice_id: '',
  value: '',
  date: '',
})

const load = (page = 1) => {
  loading.value = true
  const params = { page }
  if (filters.company_id) params.company_id = filters.company_id
  if (filters.date_from) params.date_from = filters.date_from
  if (filters.date_to) params.date_to = filters.date_to

  window.axios
    .get('/api/v1/payments', { params })
    .then((res) => {
      payments.value = res.data
    })
    .finally(() => {
      loading.value = false
    })
}

const loadCustomers = () => {
  window.axios.get('/api/v1/customers').then((res) => {
    customers.value = res.data.data ?? res.data
  })
}

const loadInvoices = () => {
  window.axios.get('/api/v1/invoices').then((res) => {
    invoices.value = res.data.data ?? res.data
  })
}

watch(() => filters.company_id, () => load())
watch(() => filters.date_from, () => load())
watch(() => filters.date_to, () => load())

const openCreateModal = () => {
  newPayment.invoice_id = ''
  newPayment.value = ''
  newPayment.date = ''
  loadInvoices()
  modalRef.value.toggleModal()
}

// Amount parsed with either "." or "," as decimal separator (e.g. "1,7" -> 1.7)
const parsedAmount = computed(() => {
  const num = parseFloat(String(newPayment.value).trim().replace(',', '.'))
  return Number.isFinite(num) && num > 0 ? num : null
})

const createPayment = () => {
  if (!newPayment.invoice_id || !parsedAmount.value) return
  saving.value = true
  window.axios
    .post('/api/v1/payments', { ...newPayment, value: parsedAmount.value })
    .then(() => {
      modalRef.value.toggleModal()
      load()
    })
    .finally(() => {
      saving.value = false
    })
}

const deletePayment = (id) => {
  window.axios.delete(`/api/v1/payments/${id}`).then(() => {
    load()
  })
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return DateTime.fromSQL(dateStr).toFormat('dd/MM/yyyy')
}

const formatCurrency = (amount) => {
  if (amount == null) return '-'
  return parseFloat(amount).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })
}

const formatInvoiceOption = (invoice) => {
  const num = invoice.number ?? '-'
  const date = invoice.date ? DateTime.fromSQL(invoice.date).toFormat('dd/MM/yyyy') : '-'
  const total = invoice.total != null
    ? parseFloat(invoice.total).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    : '-'
  return `${num} | ${date} | ${total}`
}

onMounted(() => {
  load()
  loadCustomers()
  breadcrumb.setLinks([
    { link: '/', title: 'Home' },
    { title: 'Payments' },
  ])
})
</script>

<template>
  <Auth>
    <!-- Page header -->
    <div class="flex items-center justify-between mb-2">
      <h1 class="text-xl font-bold text-gray-900 dark:text-white">Payments</h1>
      <Button variant="primary" @click="openCreateModal">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Record Payment
      </Button>
    </div>

    <!-- Tab navigation -->
    <TabNav />

    <!-- Filters -->
    <Card class="mb-4">
      <div class="flex flex-wrap items-end gap-3 p-4">
        <div class="min-w-[160px]">
          <Label forInput="customer">Customer</Label>
          <UiSelect v-model="filters.company_id">
            <option value="">All Customers</option>
            <option
              v-for="customer in customers"
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

    <!-- Payments table -->
    <Card>
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left" v-if="payments.data.length">
          <thead class="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 uppercase">
            <tr>
              <th class="px-4 py-3">ID</th>
              <th class="px-4 py-3">Invoice No.</th>
              <th class="px-4 py-3">Customer</th>
              <th class="px-4 py-3 text-right">Amount</th>
              <th class="px-4 py-3">Date</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="text-gray-700 dark:text-gray-300">
            <tr
              v-for="payment in payments.data"
              :key="payment.id"
              class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <td class="px-4 py-3 text-gray-500 dark:text-gray-400">
                {{ payment.id }}
              </td>
              <td class="px-4 py-3">
                <router-link
                  v-if="payment.invoice"
                  :to="{ name: 'invoices.edit', params: { inv_id: payment.invoice.id } }"
                  class="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  {{ payment.invoice.number }}
                </router-link>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-4 py-3">
                <router-link
                  v-if="payment.invoice?.company"
                  :to="{ name: 'invoices.customer.detail', params: { id: payment.invoice.company.id } }"
                  class="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {{ payment.invoice.company.name }}
                </router-link>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-4 py-3 text-right font-mono">
                {{ formatCurrency(payment.value) }}
              </td>
              <td class="px-4 py-3">
                {{ formatDate(payment.date) }}
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-2">
                  <InteractiveToast type="red">
                    <template #trigger>
                      <button
                        class="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </template>
                    <template #title>Delete Payment</template>
                    <template #content>
                      Are you sure you want to delete this payment of <strong>{{ formatCurrency(payment.value) }}</strong>?
                    </template>
                    <template #actions>
                      <Button variant="danger" size="sm" @click="deletePayment(payment.id)">
                        Delete
                      </Button>
                      <Button variant="ghost" size="sm">Cancel</Button>
                    </template>
                  </InteractiveToast>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty state -->
        <div
          v-else-if="!loading"
          class="flex flex-col items-center justify-center py-24 text-center"
        >
          <svg class="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
              d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
          </svg>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">No payments found</p>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-1 mb-4">
            Record your first payment to get started
          </p>
          <Button variant="primary" @click="openCreateModal">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Record Payment
          </Button>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <svg class="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </div>
    </Card>

    <!-- Pagination -->
    <div class="mt-4" v-if="payments.data.length">
      <TailwindPagination
        :limit="3"
        :data="payments"
        @pagination-change-page="load"
      />
    </div>

    <!-- Record Payment Modal -->
    <Modal ref="modalRef">
      <template #header>Record Payment</template>
      <template #body>
        <div class="space-y-4">
          <div>
            <Label forInput="invoice_id">Invoice</Label>
            <UiSelect v-model="newPayment.invoice_id">
              <option value="" disabled>Select an invoice</option>
              <option
                v-for="invoice in invoices"
                :key="invoice.id"
                :value="invoice.id"
              >
                {{ formatInvoiceOption(invoice) }}
              </option>
            </UiSelect>
          </div>
          <div>
            <Label forInput="value">Amount</Label>
            <Text
              v-model="newPayment.value"
              name="value"
              type="text"
              inputmode="decimal"
              placeholder="0.00"
            />
          </div>
          <div>
            <Label forInput="date">Date</Label>
            <DatePicker v-model="newPayment.date" name="date" />
          </div>
        </div>
      </template>
      <template #footer>
        <Button
          variant="primary"
          @click="createPayment"
          :disabled="!newPayment.invoice_id || !parsedAmount || saving"
        >
          {{ saving ? 'Saving...' : 'Save' }}
        </Button>
      </template>
    </Modal>
  </Auth>
</template>
