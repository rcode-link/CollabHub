<script setup>
import Auth from '@/components/layouts/Auth.vue'
import Card from '@/components/shared/Card.vue'
import Button from '@/components/shared/Button.vue'
import Badge from '@/components/shared/ui/Badge.vue'
import Text from '@/components/shared/Text.vue'
import Label from '@/components/shared/Label.vue'
import DatePicker from '@/components/shared/DatePicker.vue'
import Modal from '@/components/shared/Modal.vue'
import AutoComplete from '@/components/shared/AutoComplete.vue'
import Editor from '@/components/pages/project/tasks/partisals/Form/Editor.vue'
import TrashIcon from '@/components/shared/icons/TrashIcon.vue'
import currencyPrint from '@/functions/currencyPrint'
import { useBreadcrumbStore } from '@/store/breadcrumb'
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { debounce } from '@/functions/debounce'
import { DateTime } from 'luxon'

const route = useRoute()
const breadcrumb = useBreadcrumbStore()

const statusColorMap = {
  draft: 'gray',
  sent: 'blue',
  partial: 'yellow',
  paid: 'green',
  overdue: 'red',
}

const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// ── Invoice data ──────────────────────────────────────────────
const invoiceData = ref(null)
const noteValue = ref(null)
const date = ref('')
const dueDate = ref('')

// ── Billing items (autocomplete) ──────────────────────────────
const billingItems = ref([])

// ── Predefined notes ──────────────────────────────────────────
const predefinedNotes = ref([])
const showNotesDropdown = ref(false)

// ── Payment modal ─────────────────────────────────────────────
const paymentModalRef = ref(null)
const paymentModel = ref({
  invoice_id: '',
  value: '',
  date: '',
})

// ── Item price/qty/vat refs for debounced updates ──────────────
const itemPrices = ref({})
const itemQtys = ref({})
const itemVatRates = ref({})

// ── Computed VAT total ────────────────────────────────────────
const vatTotal = computed(() => {
  if (!invoiceData.value?.items) return 0
  return invoiceData.value.items.reduce((sum, item) => {
    const total = Number(item.total) || 0
    const vatRate = Number(itemVatRates.value[item.id]) || 0
    return sum + (total * vatRate) / 100
  }, 0)
})

// ── Load invoice ──────────────────────────────────────────────
const loadInvoice = async () => {
  try {
    const { data } = await window.axios.get(`/api/v1/invoices/${route.params.inv_id}`)
    const inv = data.data ?? data
    invoiceData.value = inv
    noteValue.value = inv.note
    date.value = inv.date ? DateTime.fromSQL(inv.date).toUTC().toISO() : ''
    dueDate.value = inv.due_date ? DateTime.fromSQL(inv.due_date).toUTC().toISO() : ''
    paymentModel.value.invoice_id = inv.id?.toString() ?? ''

    // Initialise per-item price/qty refs
    syncItemRefs(inv.items)

    breadcrumb.setLinks([
      { link: '/', title: 'Home' },
      {
        link: {
          name: 'invoices.customer.detail',
          params: { id: inv.company?.id },
        },
        title: inv.company?.name,
      },
      { link: {}, title: inv.number },
    ])
  } catch (err) {
    console.error(err)
  }
}

const syncItemRefs = (items) => {
  if (!items) return
  const prices = {}
  const qtys = {}
  const vats = {}
  items.forEach((item) => {
    prices[item.id] = item.price ?? 0
    qtys[item.id] = item.qty ?? 0
    vats[item.id] = item.vat_rate ?? 0
  })
  itemPrices.value = prices
  itemQtys.value = qtys
  itemVatRates.value = vats
}

// ── Load billing items for autocomplete ───────────────────────
const loadBillingItems = () => {
  window.axios.get('/api/v1/billing-items').then((res) => {
    billingItems.value = res.data.data ?? res.data
  })
}

// ── Load predefined notes ─────────────────────────────────────
const loadPredefinedNotes = () => {
  window.axios
    .get('/api/v1/invoice/data', { params: { type: 'note' } })
    .then((res) => {
      predefinedNotes.value = res.data
    })
}

// ── Update invoice fields ─────────────────────────────────────
const updateData = (payload) => {
  if (!invoiceData.value) return
  window.axios.put(`/api/v1/invoices/${invoiceData.value.id}`, payload)
}

// ── Date watchers ─────────────────────────────────────────────
watch(date, (newVal, oldVal) => {
  if (!oldVal || newVal === oldVal) return
  updateData({ date: date.value })
})

watch(dueDate, (newVal, oldVal) => {
  if (!oldVal || newVal === oldVal) return
  updateData({ due_date: dueDate.value })
})

// ── Note update (debounced) ───────────────────────────────────
const updateNote = debounce((value) => {
  if (!invoiceData.value) return
  window.axios.put(`/api/v1/invoices/${invoiceData.value.id}`, { note: value })
}, 500)

const setNote = (obj) => {
  noteValue.value = obj.data.val
  updateNote(obj.data.val)
  showNotesDropdown.value = false
}

const closeNotesDropdown = (e) => {
  if (showNotesDropdown.value) {
    showNotesDropdown.value = false
  }
}


// ── Add invoice item ──────────────────────────────────────────
const addItem = (itemId) => {
  window.axios
    .post('/api/v1/invoices-items', {
      item_id: itemId,
      invoice_id: route.params.inv_id,
    })
    .then(() => {
      loadInvoice()
    })
}

// ── Update item price/qty/vat (debounced) ─────────────────────
const updateItem = debounce((item) => {
  window.axios.put(`/api/v1/invoices-items/${item.id}`, {
    price: itemPrices.value[item.id],
    qty: itemQtys.value[item.id],
    vat_rate: itemVatRates.value[item.id] ?? 0,
  })
}, 350)

// ── Delete invoice item ───────────────────────────────────────
const deleteItem = async (item) => {
  await window.axios.delete(`/api/v1/invoices-items/${item.id}`)
  loadInvoice()
}

// ── Download PDF ──────────────────────────────────────────────
const downloadInvoice = () => {
  window.axios
    .get(`/api/v1/invoices/${route.params.inv_id}/download`, {
      responseType: 'blob',
    })
    .then((response) => {
      window.open(URL.createObjectURL(response.data))
    })
}

// ── Mark as sent ──────────────────────────────────────────────
const markAsSent = () => {
  window.axios
    .put(`/api/v1/invoices/${route.params.inv_id}`, { sent: true })
    .then(() => {
      loadInvoice()
    })
}

// ── Record payment ────────────────────────────────────────────
const submitPayment = () => {
  window.axios.post('/api/v1/payments', paymentModel.value).then(() => {
    paymentModalRef.value?.closeModal()
    paymentModel.value.value = ''
    paymentModel.value.date = ''
    loadInvoice()
  })
}

// ── Watch route param to load/reload ──────────────────────────
watch(
  () => route.params.inv_id,
  (newId) => {
    if (!newId) return

    // Set up Echo listener
    window.Echo.private(`update-invoice.${newId}`).listen(
      'InvoiceItemsUpdate',
      (payload) => {
        if (invoiceData.value) {
          invoiceData.value.items = payload.items
          syncItemRefs(payload.items)
        }
      },
    )

    loadInvoice()
    loadBillingItems()
    loadPredefinedNotes()
  },
  { immediate: true },
)

// ── Cleanup Echo ──────────────────────────────────────────────
onUnmounted(() => {
  window.Echo.leave(`update-invoice.${route.params.inv_id}`)
})

// ── Autocomplete items mapped ─────────────────────────────────
const mappedBillingItems = () =>
  billingItems.value.map((obj) => ({
    label: obj.name,
    value: obj.id,
  }))
</script>

<template>
  <Auth>
    <!-- ── Top Section: Company Info + Invoice Metadata ── -->
    <div
      v-if="invoiceData"
      class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
    >
      <!-- Left column — Company Info Card -->
      <Card class="p-5">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ invoiceData.company?.name }}
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {{
            invoiceData.company?.billing_address ??
            invoiceData.company?.address
          }}<br />
          {{
            invoiceData.company?.billing_city ?? invoiceData.company?.city
          }}
          {{
            invoiceData.company?.billing_zip ?? invoiceData.company?.zip
          }}<br />
          {{
            invoiceData.company?.billing_country ??
            invoiceData.company?.country
          }}
        </p>

        <Badge v-if="invoiceData.status" :color="statusColorMap[invoiceData.status] ?? 'gray'" class="mt-2">
          {{ capitalize(invoiceData.status) }}
        </Badge>

        <!-- Action buttons -->
        <div class="flex gap-2 mt-4">
          <Button variant="soft" size="sm" @click="downloadInvoice">
            Download
          </Button>

          <Modal ref="paymentModalRef">
            <template #button>
              <Button variant="soft" size="sm">Record Payment</Button>
            </template>
            <template #header>Record Payment</template>
            <template #body>
              <form @submit.prevent="submitPayment">
                <div class="mb-4">
                  <Label forInput="payment-amount">Amount</Label>
                  <Text
                    name="payment-amount"
                    type="number"
                    v-model="paymentModel.value"
                  />
                </div>
                <div class="mb-4">
                  <Label forInput="payment-date">Date</Label>
                  <DatePicker
                    name="payment-date"
                    v-model="paymentModel.date"
                  />
                </div>
              </form>
            </template>
            <template #footer>
              <Button variant="primary" @click="submitPayment">Save</Button>
            </template>
          </Modal>

          <Button
            v-if="!invoiceData.sent"
            variant="soft"
            size="sm"
            @click="markAsSent"
          >
            Mark as sent
          </Button>
        </div>
      </Card>

      <!-- Right column — Invoice Metadata -->
      <div class="flex flex-col gap-4 justify-between">
        <div>
          <Label forInput="invoice-number">Invoice No:</Label>
          <Text
            name="invoice-number"
            v-model="invoiceData.number"
            disabled
          />
        </div>
        <div>
          <Label forInput="invoice-date">Invoice Date:</Label>
          <DatePicker name="invoice-date" v-model="date" />
        </div>
        <div>
          <Label forInput="invoice-due-date">Invoice Due date:</Label>
          <DatePicker name="invoice-due-date" v-model="dueDate" />
        </div>
      </div>
    </div>

    <!-- ── Item Search (Autocomplete) ── -->
    <div class="mb-4">
      <Label forInput="items">Select item</Label>
      <AutoComplete
        name="items"
        :items="mappedBillingItems()"
        @search="loadBillingItems"
        @selected="addItem"
      />
    </div>

    <!-- ── Invoice Items Table ── -->
    <Card v-if="invoiceData?.items" class="mb-4 overflow-auto">
      <table class="w-full text-sm text-left">
        <thead
          class="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 uppercase"
        >
          <tr>
            <th class="px-4 py-3">#</th>
            <th class="px-4 py-3">Name</th>
            <th class="px-4 py-3">Price</th>
            <th class="px-4 py-3">Qty</th>
            <th class="px-4 py-3">Unit</th>
            <th class="px-4 py-3">Total</th>
            <th class="px-4 py-3">VAT %</th>
            <th class="px-4 py-3">VAT</th>
            <th class="px-4 py-3">Total + VAT</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in invoiceData.items"
            :key="item.id"
            class="border-b border-gray-100 dark:border-gray-800"
          >
            <td class="px-4 py-3 text-gray-900 dark:text-white">
              {{ index + 1 }}
            </td>
            <td class="px-4 py-3 text-gray-900 dark:text-white">
              {{ item.name }}
            </td>
            <td class="px-4 py-3">
              <Text
                type="number"
                v-model="itemPrices[item.id]"
                @update:model-value="() => updateItem(item)"
              />
            </td>
            <td class="px-4 py-3">
              <Text
                type="number"
                v-model="itemQtys[item.id]"
                @update:model-value="() => updateItem(item)"
              />
            </td>
            <td class="px-4 py-3 text-gray-500 dark:text-gray-400">
              {{ item.billing_item?.unit ?? '' }}
            </td>
            <td class="px-4 py-3 text-gray-900 dark:text-white">
              {{
                currencyPrint(
                  Number(item.total),
                  invoiceData.company?.currency,
                )
              }}
            </td>
            <td class="px-4 py-3">
              <Text
                type="number"
                v-model="itemVatRates[item.id]"
                placeholder="0"
                @update:model-value="() => updateItem(item)"
              />
            </td>
            <td class="px-4 py-3 text-gray-900 dark:text-white whitespace-nowrap">
              {{
                currencyPrint(
                  Number(item.total) * Number(itemVatRates[item.id] || 0) / 100,
                  invoiceData.company?.currency,
                )
              }}
            </td>
            <td class="px-4 py-3 text-gray-900 dark:text-white font-medium whitespace-nowrap">
              {{
                currencyPrint(
                  Number(item.total) + Number(item.total) * Number(itemVatRates[item.id] || 0) / 100,
                  invoiceData.company?.currency,
                )
              }}
            </td>
            <td class="px-4 py-3">
              <Button variant="ghost" size="sm" @click="deleteItem(item)">
                <TrashIcon class="w-4 h-4 text-red-500" />
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
    </Card>

    <!-- ── Bottom Section: Notes + Total ── -->
    <div
      v-if="invoiceData"
      class="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      <!-- Left column — Notes -->
      <Card class="md:col-span-2">
        <div class="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-white">Invoice Notes</h4>
        </div>
        <div class="p-5">
          <Editor
            :model-value="noteValue ?? ''"
            @update:markdown="updateNote"
          >
            <template #header>
              <div class="relative inline-block" @click.stop>
                <button
                  type="button"
                  class="inline-flex items-center justify-center gap-1.5 font-medium rounded-lg transition-colors px-2.5 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                  @click.stop.prevent="showNotesDropdown = !showNotesDropdown"
                >
                  Insert note
                </button>
                <div
                  v-if="showNotesDropdown"
                  class="absolute z-20 mt-1 left-0 w-56 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg py-1"
                >
                  <button
                    v-for="obj in predefinedNotes"
                    :key="obj.id"
                    type="button"
                    class="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    @click.stop="setNote(obj)"
                  >
                    {{ obj.data.title }}
                  </button>
                  <p v-if="!predefinedNotes.length" class="px-3 py-2 text-xs text-gray-400">No predefined notes</p>
                </div>
              </div>
            </template>
          </Editor>
        </div>
      </Card>

      <!-- Right column — Total summary -->
      <Card>
        <div class="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-white">Summary</h4>
        </div>
        <div class="p-5">
          <div class="flex items-center justify-between py-2 text-sm">
            <span class="text-gray-500 dark:text-gray-400">Subtotal</span>
            <span class="text-gray-900 dark:text-white font-medium">
              {{
                currencyPrint(
                  Number(invoiceData.total),
                  invoiceData.company?.currency,
                )
              }}
            </span>
          </div>
          <div class="flex items-center justify-between py-2 text-sm border-t border-gray-100 dark:border-gray-800">
            <span class="text-gray-500 dark:text-gray-400">VAT Total</span>
            <span class="text-gray-900 dark:text-white font-medium">
              {{
                currencyPrint(
                  vatTotal,
                  invoiceData.company?.currency,
                )
              }}
            </span>
          </div>
          <div class="flex items-center justify-between py-2 text-sm border-t border-gray-100 dark:border-gray-800">
            <span class="text-gray-500 dark:text-gray-400">Total with VAT</span>
            <span class="text-gray-900 dark:text-white font-medium">
              {{
                currencyPrint(
                  Number(invoiceData.total) + vatTotal,
                  invoiceData.company?.currency,
                )
              }}
            </span>
          </div>
          <div class="flex items-center justify-between py-2 text-sm border-t border-gray-100 dark:border-gray-800">
            <span class="text-gray-500 dark:text-gray-400">Paid</span>
            <span class="text-green-600 dark:text-green-400 font-medium">
              {{
                currencyPrint(
                  Number(invoiceData.total) + vatTotal - Number(invoiceData.due_amount),
                  invoiceData.company?.currency,
                )
              }}
            </span>
          </div>
          <div class="flex items-center justify-between py-3 text-sm border-t-2 border-gray-200 dark:border-gray-700 mt-1">
            <span class="font-semibold text-gray-900 dark:text-white">Due Amount</span>
            <span class="font-bold text-gray-900 dark:text-white text-base">
              {{
                currencyPrint(
                  Number(invoiceData.due_amount),
                  invoiceData.company?.currency,
                )
              }}
            </span>
          </div>
        </div>
      </Card>
    </div>
  </Auth>
</template>
