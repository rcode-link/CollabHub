<script setup>
import Auth from '@/components/layouts/Auth.vue'
import Card from '@/components/shared/Card.vue'
import Button from '@/components/shared/Button.vue'
import Badge from '@/components/shared/ui/Badge.vue'
import UiSelect from '@/components/shared/ui/Select.vue'
import AutoComplete from '@/components/shared/AutoComplete.vue'
import Text from '@/components/shared/Text.vue'
import Modal from '@/components/shared/Modal.vue'
import Label from '@/components/shared/Label.vue'
import DatePicker from '@/components/shared/DatePicker.vue'
import InteractiveToast from '@/components/shared/InteractiveToast.vue'
import TabNav from '../partials/TabNav.vue'
import { TailwindPagination } from 'laravel-vue-pagination'
import { useBreadcrumbStore } from '@/store/breadcrumb'
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { debounce } from '@/functions/debounce'
import { DateTime } from 'luxon'

const breadcrumb = useBreadcrumbStore()
const router = useRouter()

const invoices = ref({ data: [] })
const customers = ref([])
const loading = ref(false)
const modalRef = ref()
const saving = ref(false)

const filters = reactive({
  search: '',
  company_id: '',
  status: '',
  date_from: '',
  date_to: '',
})

const newInvoice = reactive({
  company_id: '',
  number: '',
  date: '',
  due_date: '',
})

const statusOptions = [
  { value: '', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'partial', label: 'Partial' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
]

const statusColorMap = {
  draft: 'gray',
  sent: 'blue',
  partial: 'yellow',
  paid: 'green',
  overdue: 'red',
}

const load = (page = 1) => {
  loading.value = true
  const params = { page }
  if (filters.search) params.search = filters.search
  if (filters.company_id) params.company_id = filters.company_id
  if (filters.status) params.status = filters.status
  if (filters.date_from) params.date_from = filters.date_from
  if (filters.date_to) params.date_to = filters.date_to

  window.axios
    .get('/api/v1/invoices', { params })
    .then((res) => {
      invoices.value = res.data
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

const debouncedLoad = debounce(() => load(), 300)

watch(() => filters.search, debouncedLoad)
watch(() => filters.company_id, () => load())
watch(() => filters.status, () => load())
watch(() => filters.date_from, () => load())
watch(() => filters.date_to, () => load())

const selectedCustomerName = ref('')

const customerAutocompleteItems = computed(() =>
  customers.value.map((c) => ({ label: c.name, value: c.id }))
)

const onCustomerSelected = (customerId) => {
  newInvoice.company_id = customerId
  const customer = customers.value.find((c) => c.id === customerId)
  if (customer) {
    selectedCustomerName.value = customer.name
    // Fetch next sequential invoice number from backend
    window.axios
      .get('/api/v1/invoices/next-number', { params: { company_id: customerId } })
      .then((res) => {
        newInvoice.number = res.data.number
      })
  }
}

const openCreateModal = () => {
  newInvoice.company_id = ''
  newInvoice.number = ''
  newInvoice.date = ''
  newInvoice.due_date = ''
  selectedCustomerName.value = ''
  modalRef.value.toggleModal()
}

const createInvoice = () => {
  if (!newInvoice.company_id || !newInvoice.number) return
  saving.value = true
  window.axios
    .post('/api/v1/invoices', { ...newInvoice })
    .then((res) => {
      modalRef.value.toggleModal()
      router.push({
        name: 'invoices.edit',
        params: { inv_id: res.data.data?.id ?? res.data.id },
      })
    })
    .finally(() => {
      saving.value = false
    })
}

const deleteInvoice = (id) => {
  window.axios.delete(`/api/v1/invoices/${id}`).then(() => {
    load()
  })
}

const downloadPdf = (id) => {
  window.axios
    .get(`/api/v1/invoices/${id}/download`, { responseType: 'blob' })
    .then((res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `invoice-${id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    })
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return DateTime.fromISO(dateStr).toFormat('dd/MM/yyyy')
}

const formatCurrency = (amount) => {
  if (amount == null) return '-'
  return parseFloat(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

onMounted(() => {
  load()
  loadCustomers()
  breadcrumb.setLinks([
    { link: '/', title: 'Home' },
    { title: 'Invoices' },
  ])
})
</script>

<template>
  <Auth>
    <!-- Page header -->
    <div class="flex items-center justify-between mb-2">
      <h1 class="text-xl font-bold text-gray-900 dark:text-white">Invoices</h1>
      <Button variant="primary" @click="openCreateModal">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New Invoice
      </Button>
    </div>

    <!-- Tab navigation -->
    <TabNav />

    <!-- Filters -->
    <Card class="mb-4">
      <div class="flex flex-wrap items-end gap-3 p-4">
        <div class="flex-1 min-w-[180px]">
          <Label forInput="search">Search</Label>
          <Text
            v-model="filters.search"
            name="search"
            placeholder="Search invoices..."
          />
        </div>

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

        <div class="min-w-[140px]">
          <Label forInput="status">Status</Label>
          <UiSelect v-model="filters.status">
            <option
              v-for="opt in statusOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
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

    <!-- Invoice table -->
    <Card>
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left" v-if="invoices.data.length">
          <thead class="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 uppercase">
            <tr>
              <th class="px-4 py-3">Invoice No.</th>
              <th class="px-4 py-3">Customer</th>
              <th class="px-4 py-3">Date</th>
              <th class="px-4 py-3">Due Date</th>
              <th class="px-4 py-3 text-right">Total</th>
              <th class="px-4 py-3 text-right">Due Amount</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="text-gray-700 dark:text-gray-300">
            <tr
              v-for="invoice in invoices.data"
              :key="invoice.id"
              class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <td class="px-4 py-3">
                <router-link
                  :to="{ name: 'invoices.edit', params: { inv_id: invoice.id } }"
                  class="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  {{ invoice.number }}
                </router-link>
              </td>
              <td class="px-4 py-3">
                <router-link
                  v-if="invoice.company"
                  :to="{ name: 'invoices.customer.detail', params: { id: invoice.company_id } }"
                  class="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {{ invoice.company.name }}
                </router-link>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-4 py-3">{{ formatDate(invoice.date) }}</td>
              <td class="px-4 py-3">{{ formatDate(invoice.due_date) }}</td>
              <td class="px-4 py-3 text-right font-mono">{{ formatCurrency(invoice.total) }}</td>
              <td class="px-4 py-3 text-right font-mono">{{ formatCurrency(invoice.due_amount) }}</td>
              <td class="px-4 py-3">
                <Badge :color="statusColorMap[invoice.status] ?? 'gray'">
                  {{ capitalize(invoice.status) }}
                </Badge>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-2">
                  <router-link
                    :to="{ name: 'invoices.edit', params: { inv_id: invoice.id } }"
                    class="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="View"
                  >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </router-link>

                  <button
                    @click="downloadPdf(invoice.id)"
                    class="text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                    title="Download PDF"
                  >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a2 2 0 002 2h14a2 2 0 002-2v-3" />
                    </svg>
                  </button>

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
                    <template #title>Delete Invoice</template>
                    <template #content>
                      Are you sure you want to delete invoice <strong>{{ invoice.number }}</strong>?
                    </template>
                    <template #actions>
                      <Button variant="danger" size="sm" @click="deleteInvoice(invoice.id)">
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">No invoices found</p>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-1 mb-4">
            Create your first invoice to get started
          </p>
          <Button variant="primary" @click="openCreateModal">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            New Invoice
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
    <div class="mt-4" v-if="invoices.data.length">
      <TailwindPagination
        :limit="3"
        :data="invoices"
        @pagination-change-page="load"
      />
    </div>

    <!-- Create Invoice Modal -->
    <Modal ref="modalRef">
      <template #header>New Invoice</template>
      <template #body>
        <div class="space-y-4">
          <div>
            <Label forInput="company_id">Customer</Label>
            <AutoComplete
              :items="customerAutocompleteItems"
              @search="loadCustomers"
              @selected="onCustomerSelected"
            />
            <p v-if="selectedCustomerName" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Selected: <strong>{{ selectedCustomerName }}</strong>
            </p>
          </div>
          <div>
            <Label forInput="number">Invoice Number</Label>
            <Text
              v-model="newInvoice.number"
              name="number"
              placeholder="Auto-generated on customer select"
            />
            <p class="mt-1 text-xs text-gray-400">Auto-generated when you select a customer. You can edit it.</p>
          </div>
          <div>
            <Label forInput="date">Date</Label>
            <DatePicker v-model="newInvoice.date" name="date" />
          </div>
          <div>
            <Label forInput="due_date">Due Date</Label>
            <DatePicker v-model="newInvoice.due_date" name="due_date" />
          </div>
        </div>
      </template>
      <template #footer>
        <Button
          variant="primary"
          @click="createInvoice"
          :disabled="!newInvoice.company_id || !newInvoice.number || saving"
        >
          {{ saving ? 'Creating...' : 'Create' }}
        </Button>
      </template>
    </Modal>
  </Auth>
</template>
