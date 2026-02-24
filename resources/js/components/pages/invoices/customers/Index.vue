<script setup>
import Auth from '@/components/layouts/Auth.vue'
import Card from '@/components/shared/Card.vue'
import Button from '@/components/shared/Button.vue'
import UiSelect from '@/components/shared/ui/Select.vue'
import Text from '@/components/shared/Text.vue'
import Modal from '@/components/shared/Modal.vue'
import Label from '@/components/shared/Label.vue'
import TabNav from '../partials/TabNav.vue'
import { TailwindPagination } from 'laravel-vue-pagination'
import { useBreadcrumbStore } from '@/store/breadcrumb'
import { ref, reactive, onMounted } from 'vue'

const breadcrumb = useBreadcrumbStore()
const customers = ref({ data: [] })
const currencies = ref([])
const loading = ref(false)
const saving = ref(false)
const modalRef = ref()

const form = reactive({
    name: '',
    prefix: '',
    currency_id: '',
    default_vat_rate: '',
    address: '',
    city: '',
    zip: '',
    country: '',
    billing_address: '',
    billing_city: '',
    billing_zip: '',
    billing_country: '',
})

const resetForm = () => {
    form.name = ''
    form.prefix = ''
    form.currency_id = ''
    form.default_vat_rate = ''
    form.address = ''
    form.city = ''
    form.zip = ''
    form.country = ''
    form.billing_address = ''
    form.billing_city = ''
    form.billing_zip = ''
    form.billing_country = ''
}

const load = (page = 1) => {
    loading.value = true
    window.axios.get('/api/v1/customers', { params: { page } }).then(res => {
        customers.value = res.data
    }).finally(() => {
        loading.value = false
    })
}

const loadCurrencies = () => {
    window.axios.get('/api/v1/currency').then(res => {
        currencies.value = res.data
    })
}

const openModal = () => {
    resetForm()
    modalRef.value.toggleModal()
}

const createCustomer = () => {
    if (!form.name.trim()) return
    saving.value = true
    window.axios.post('/api/v1/customers', { ...form }).then(() => {
        modalRef.value.toggleModal()
        load()
    }).finally(() => {
        saving.value = false
    })
}

onMounted(() => {
    load()
    loadCurrencies()
    breadcrumb.setLinks([
        { link: '/', title: 'Home' },
        { link: { name: 'invoices.list' }, title: 'Invoices' },
        { title: 'Customers' },
    ])
})
</script>

<template>
    <Auth>
        <!-- Page header -->
        <div class="flex items-center justify-between mb-2">
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">Customers</h1>
            <Button variant="primary" @click="openModal">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Customer
            </Button>
        </div>

        <!-- Tab navigation -->
        <TabNav />

        <!-- Customer grid -->
        <div
            v-if="customers.data.length"
            class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
            <router-link
                v-for="customer in customers.data"
                :key="customer.id"
                :to="{ name: 'invoices.customer.detail', params: { id: customer.id } }"
                class="block h-full"
            >
                <Card class="h-full transition hover:shadow-md">
                    <div class="p-5">
                        <div class="flex items-start justify-between gap-2 mb-1">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                                {{ customer.name }}
                            </h3>
                            <span
                                v-if="customer.prefix"
                                class="flex-shrink-0 rounded bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 text-xs font-mono text-gray-500 dark:text-gray-400"
                            >
                                {{ customer.prefix }}
                            </span>
                        </div>
                        <p
                            v-if="customer.address || customer.city || customer.country"
                            class="text-sm text-gray-500 dark:text-gray-400 mt-2"
                        >
                            <span v-if="customer.address">{{ customer.address }}</span>
                            <span v-if="customer.address && (customer.city || customer.country)">, </span>
                            <span v-if="customer.city">{{ customer.city }}</span>
                            <span v-if="customer.city && customer.country">, </span>
                            <span v-if="customer.country">{{ customer.country }}</span>
                        </p>
                        <p
                            v-if="customer.currency"
                            class="text-xs text-gray-400 dark:text-gray-500 mt-1"
                        >
                            {{ customer.currency.currency }}
                        </p>
                    </div>
                </Card>
            </router-link>
        </div>

        <!-- Empty state -->
        <div v-else-if="!loading" class="flex flex-col items-center justify-center py-24 text-center">
            <svg class="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">No customers yet</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1 mb-4">Create your first customer to start invoicing</p>
            <Button variant="primary" @click="openModal">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Customer
            </Button>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="flex justify-center py-24">
            <svg class="h-8 w-8 animate-spin text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
        </div>

        <!-- Pagination -->
        <TailwindPagination
            v-if="customers.data.length"
            :limit="3"
            :data="customers"
            class="mt-6"
            @pagination-change-page="load"
        />

        <!-- Create customer modal -->
        <Modal ref="modalRef" size="xl">
            <template #header>
                <h2 class="text-base font-semibold">New Customer</h2>
            </template>
            <template #body>
                <div class="space-y-5">
                    <!-- Basic info -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label forInput="name">Name</Label>
                            <Text v-model="form.name" name="name" placeholder="Company name" />
                        </div>
                        <div>
                            <Label forInput="prefix">Prefix</Label>
                            <Text v-model="form.prefix" name="prefix" placeholder="e.g. ACME" />
                            <p class="mt-1 text-xs text-gray-400">(used for invoice number)</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label forInput="currency_id">Currency</Label>
                            <UiSelect v-model="form.currency_id">
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
                            <Label forInput="default_vat_rate">Default VAT Rate (%)</Label>
                            <Text v-model="form.default_vat_rate" name="default_vat_rate" type="number" placeholder="0" />
                            <p class="mt-1 text-xs text-gray-400">Auto-applied to new invoice items</p>
                        </div>
                    </div>

                    <!-- Address section -->
                    <div>
                        <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Address</h4>
                        <div class="space-y-3">
                            <div>
                                <Label forInput="address">Street address</Label>
                                <Text v-model="form.address" name="address" placeholder="Street address" />
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <Label forInput="city">City</Label>
                                    <Text v-model="form.city" name="city" placeholder="City" />
                                </div>
                                <div>
                                    <Label forInput="zip">ZIP code</Label>
                                    <Text v-model="form.zip" name="zip" placeholder="ZIP" />
                                </div>
                                <div>
                                    <Label forInput="country">Country</Label>
                                    <Text v-model="form.country" name="country" placeholder="Country" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Billing address section -->
                    <div>
                        <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Billing Address</h4>
                        <div class="space-y-3">
                            <div>
                                <Label forInput="billing_address">Street address</Label>
                                <Text v-model="form.billing_address" name="billing_address" placeholder="Billing street address" />
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <Label forInput="billing_city">City</Label>
                                    <Text v-model="form.billing_city" name="billing_city" placeholder="City" />
                                </div>
                                <div>
                                    <Label forInput="billing_zip">ZIP code</Label>
                                    <Text v-model="form.billing_zip" name="billing_zip" placeholder="ZIP" />
                                </div>
                                <div>
                                    <Label forInput="billing_country">Country</Label>
                                    <Text v-model="form.billing_country" name="billing_country" placeholder="Country" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
            <template #footer>
                <Button
                    variant="primary"
                    :disabled="!form.name.trim() || saving"
                    @click="createCustomer"
                >
                    {{ saving ? 'Creating...' : 'Create' }}
                </Button>
            </template>
        </Modal>
    </Auth>
</template>
