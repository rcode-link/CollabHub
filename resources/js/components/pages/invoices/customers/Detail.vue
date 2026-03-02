<script setup>
import Auth from '@/components/layouts/Auth.vue'
import Card from '@/components/shared/Card.vue'
import Badge from '@/components/shared/ui/Badge.vue'
import Button from '@/components/shared/Button.vue'
import Modal from '@/components/shared/Modal.vue'
import Text from '@/components/shared/Text.vue'
import Label from '@/components/shared/Label.vue'
import UiSelect from '@/components/shared/ui/Select.vue'
import { TailwindPagination } from 'laravel-vue-pagination'
import { useBreadcrumbStore } from '@/store/breadcrumb'
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { DateTime } from 'luxon'

const route = useRoute()
const breadcrumb = useBreadcrumbStore()

const customer = ref(null)
const invoices = ref({ data: [] })
const payments = ref({ data: [] })
const currencies = ref([])
const loading = ref(false)
const saving = ref(false)
const editModalRef = ref()

const statusColor = {
  draft: 'gray',
  sent: 'blue',
  partial: 'yellow',
  paid: 'green',
  overdue: 'red',
}

const loadCustomer = () => {
  window.axios.get(`/api/v1/customers/${route.params.id}`).then((res) => {
    customer.value = res.data.data ?? res.data
    breadcrumb.setLinks([
      { link: '/', title: 'Home' },
      { link: { name: 'invoices.list' }, title: 'Invoices' },
      { link: { name: 'invoices.customers' }, title: 'Customers' },
      { title: customer.value.name },
    ])
  })
}

const loadInvoices = (page = 1) => {
  loading.value = true
  window.axios
    .get('/api/v1/invoices', { params: { company_id: route.params.id, page } })
    .then((res) => {
      invoices.value = res.data
    })
    .finally(() => {
      loading.value = false
    })
}

const loadPayments = (page = 1) => {
  window.axios
    .get('/api/v1/payments', { params: { company_id: route.params.id, page } })
    .then((res) => {
      payments.value = res.data
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

// ── Edit form ───────────────────────────────────────────────
const editForm = reactive({
  name: '',
  prefix: '',
  email: '',
  currency_id: '',
  default_vat_rate: '',
  invoice_locale: 'en',
  address: '',
  city: '',
  zip: '',
  country: '',
  billing_address: '',
  billing_city: '',
  billing_zip: '',
  billing_country: '',
})

const loadCurrencies = () => {
  window.axios.get('/api/v1/currency').then((res) => {
    currencies.value = res.data.data ?? res.data
  })
}

const openEditModal = () => {
  if (!customer.value) return
  editForm.name = customer.value.name ?? ''
  editForm.prefix = customer.value.prefix ?? ''
  editForm.email = customer.value.email ?? ''
  editForm.currency_id = customer.value.currency?.id ?? ''
  editForm.default_vat_rate = customer.value.default_vat_rate ?? ''
  editForm.invoice_locale = customer.value.invoice_locale ?? 'en'
  editForm.address = customer.value.address ?? ''
  editForm.city = customer.value.city ?? ''
  editForm.zip = customer.value.zip ?? ''
  editForm.country = customer.value.country ?? ''
  editForm.billing_address = customer.value.billing_address ?? ''
  editForm.billing_city = customer.value.billing_city ?? ''
  editForm.billing_zip = customer.value.billing_zip ?? ''
  editForm.billing_country = customer.value.billing_country ?? ''
  editModalRef.value.toggleModal()
}

const updateCustomer = () => {
  if (!editForm.name.trim()) return
  saving.value = true
  window.axios
    .put(`/api/v1/customers/${route.params.id}`, { ...editForm })
    .then(() => {
      editModalRef.value.closeModal()
      loadCustomer()
    })
    .finally(() => {
      saving.value = false
    })
}

onMounted(() => {
  loadCustomer()
  loadInvoices()
  loadPayments()
  loadCurrencies()
})
</script>

<template>
  <Auth>
    <!-- Back link -->
    <router-link
      :to="{ name: 'invoices.customers' }"
      class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1 mb-4"
    >
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      Back to Customers
    </router-link>

    <!-- Loading state -->
    <div v-if="!customer" class="flex justify-center py-24">
      <svg class="h-8 w-8 animate-spin text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <template v-if="customer">
      <!-- Customer info card -->
      <Card>
        <div class="p-5">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                {{ customer.name }}
              </h2>
              <span
                v-if="customer.prefix"
                class="rounded bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs font-mono text-gray-500 dark:text-gray-400"
              >
                {{ customer.prefix }}
              </span>
            </div>
            <Button variant="soft" size="sm" @click="openEditModal">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              Edit
            </Button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Address -->
            <div>
              <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Address</h4>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                <template v-if="customer.address || customer.city || customer.zip || customer.country">
                  <span v-if="customer.address">{{ customer.address }}<br /></span>
                  <span v-if="customer.city">{{ customer.city }}</span>
                  <span v-if="customer.city && customer.zip">, </span>
                  <span v-if="customer.zip">{{ customer.zip }}</span>
                  <br v-if="(customer.city || customer.zip) && customer.country" />
                  <span v-if="customer.country">{{ customer.country }}</span>
                </template>
                <span v-else class="italic">No address provided</span>
              </p>
            </div>

            <!-- Billing Address -->
            <div>
              <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Billing Address</h4>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                <template v-if="customer.billing_address || customer.billing_city || customer.billing_zip || customer.billing_country">
                  <span v-if="customer.billing_address">{{ customer.billing_address }}<br /></span>
                  <span v-if="customer.billing_city">{{ customer.billing_city }}</span>
                  <span v-if="customer.billing_city && customer.billing_zip">, </span>
                  <span v-if="customer.billing_zip">{{ customer.billing_zip }}</span>
                  <br v-if="(customer.billing_city || customer.billing_zip) && customer.billing_country" />
                  <span v-if="customer.billing_country">{{ customer.billing_country }}</span>
                </template>
                <span v-else class="italic">No billing address provided</span>
              </p>
            </div>
          </div>

          <!-- Currency, VAT, Email & Language -->
          <div class="flex flex-wrap items-center gap-4 mt-4">
            <p v-if="customer.email" class="text-xs text-gray-400 dark:text-gray-500">
              Email: {{ customer.email }}
            </p>
            <p v-if="customer.currency" class="text-xs text-gray-400 dark:text-gray-500">
              Currency: {{ customer.currency.currency }}
            </p>
            <p v-if="customer.default_vat_rate > 0" class="text-xs text-gray-400 dark:text-gray-500">
              Default VAT: {{ customer.default_vat_rate }}%
            </p>
            <p class="text-xs text-gray-400 dark:text-gray-500">
              Invoice Language: {{ customer.invoice_locale === 'bs' ? 'Bosanski' : 'English' }}
            </p>
          </div>
        </div>
      </Card>

      <!-- Invoices section -->
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">Invoices</h3>

      <Card>
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left" v-if="invoices.data.length">
            <thead class="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 uppercase">
              <tr>
                <th class="px-4 py-3">Invoice No.</th>
                <th class="px-4 py-3">Date</th>
                <th class="px-4 py-3">Due Date</th>
                <th class="px-4 py-3 text-right">Total</th>
                <th class="px-4 py-3 text-right">Due Amount</th>
                <th class="px-4 py-3">Status</th>
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
                <td class="px-4 py-3">{{ formatDate(invoice.date) }}</td>
                <td class="px-4 py-3">{{ formatDate(invoice.due_date) }}</td>
                <td class="px-4 py-3 text-right font-mono">{{ formatCurrency(invoice.total) }}</td>
                <td class="px-4 py-3 text-right font-mono">{{ formatCurrency(invoice.due_amount) }}</td>
                <td class="px-4 py-3">
                  <Badge :color="statusColor[invoice.status] ?? 'gray'">
                    {{ capitalize(invoice.status) }}
                  </Badge>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty state -->
          <div
            v-else-if="!loading"
            class="flex flex-col items-center justify-center py-16 text-center"
          >
            <svg class="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">No invoices for this customer</p>
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

      <!-- Invoices pagination -->
      <div class="mt-4" v-if="invoices.data.length">
        <TailwindPagination
          :limit="3"
          :data="invoices"
          @pagination-change-page="loadInvoices"
        />
      </div>

      <!-- Payments section -->
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">Payments</h3>

      <Card>
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left" v-if="payments.data.length">
            <thead class="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 uppercase">
              <tr>
                <th class="px-4 py-3">ID</th>
                <th class="px-4 py-3">Invoice No.</th>
                <th class="px-4 py-3 text-right">Amount</th>
                <th class="px-4 py-3">Date</th>
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
                <td class="px-4 py-3 text-right font-mono">
                  {{ formatCurrency(payment.value) }}
                </td>
                <td class="px-4 py-3">
                  {{ formatDate(payment.date) }}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty state -->
          <div
            v-else
            class="flex flex-col items-center justify-center py-16 text-center"
          >
            <svg class="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">No payments for this customer</p>
          </div>
        </div>
      </Card>

      <!-- Payments pagination -->
      <div class="mt-4" v-if="payments.data.length">
        <TailwindPagination
          :limit="3"
          :data="payments"
          @pagination-change-page="loadPayments"
        />
      </div>
    </template>

    <!-- Edit customer modal -->
    <Modal ref="editModalRef" size="xl">
      <template #header>
        <h2 class="text-base font-semibold">Edit Customer</h2>
      </template>
      <template #body>
        <div class="space-y-5">
          <!-- Basic info -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label forInput="edit-name">Name</Label>
              <Text v-model="editForm.name" name="edit-name" placeholder="Company name" />
            </div>
            <div>
              <Label forInput="edit-prefix">Prefix</Label>
              <Text v-model="editForm.prefix" name="edit-prefix" placeholder="e.g. ACME" />
              <p class="mt-1 text-xs text-gray-400">(used for invoice number)</p>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label forInput="edit-email">Email</Label>
              <Text v-model="editForm.email" name="edit-email" type="email" placeholder="billing@example.com" />
            </div>
            <div>
              <Label forInput="edit-invoice_locale">Invoice Language</Label>
              <UiSelect v-model="editForm.invoice_locale">
                <option value="en">English</option>
                <option value="bs">Bosanski</option>
              </UiSelect>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label forInput="edit-currency_id">Currency</Label>
              <UiSelect v-model="editForm.currency_id">
                <option value="" disabled>Select currency</option>
                <option
                  v-for="currency in currencies"
                  :key="currency.id"
                  :value="currency.id"
                >
                  {{ currency.currency }} ({{ currency.format }})
                </option>
              </UiSelect>
            </div>
            <div>
              <Label forInput="edit-default_vat_rate">Default VAT Rate (%)</Label>
              <Text v-model="editForm.default_vat_rate" name="edit-default_vat_rate" type="number" placeholder="0" />
              <p class="mt-1 text-xs text-gray-400">Auto-applied to new invoice items</p>
            </div>
          </div>

          <!-- Address section -->
          <div>
            <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Address</h4>
            <div class="space-y-3">
              <div>
                <Label forInput="edit-address">Street address</Label>
                <Text v-model="editForm.address" name="edit-address" placeholder="Street address" />
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label forInput="edit-city">City</Label>
                  <Text v-model="editForm.city" name="edit-city" placeholder="City" />
                </div>
                <div>
                  <Label forInput="edit-zip">ZIP code</Label>
                  <Text v-model="editForm.zip" name="edit-zip" placeholder="ZIP" />
                </div>
                <div>
                  <Label forInput="edit-country">Country</Label>
                  <Text v-model="editForm.country" name="edit-country" placeholder="Country" />
                </div>
              </div>
            </div>
          </div>

          <!-- Billing address section -->
          <div>
            <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Billing Address</h4>
            <div class="space-y-3">
              <div>
                <Label forInput="edit-billing_address">Street address</Label>
                <Text v-model="editForm.billing_address" name="edit-billing_address" placeholder="Billing street address" />
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label forInput="edit-billing_city">City</Label>
                  <Text v-model="editForm.billing_city" name="edit-billing_city" placeholder="City" />
                </div>
                <div>
                  <Label forInput="edit-billing_zip">ZIP code</Label>
                  <Text v-model="editForm.billing_zip" name="edit-billing_zip" placeholder="ZIP" />
                </div>
                <div>
                  <Label forInput="edit-billing_country">Country</Label>
                  <Text v-model="editForm.billing_country" name="edit-billing_country" placeholder="Country" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <Button
          variant="primary"
          :disabled="!editForm.name.trim() || saving"
          @click="updateCustomer"
        >
          {{ saving ? 'Saving...' : 'Save' }}
        </Button>
      </template>
    </Modal>
  </Auth>
</template>
