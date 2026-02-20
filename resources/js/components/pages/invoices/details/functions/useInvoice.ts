import { Pagination } from '@/interfaces'
import { useInvoiceDetailsStore } from '@/store/invoiceDetailsStore'
import { InvoiceResource } from '@/types'
import { ref } from 'vue'
import { useRoute } from 'vue-router'

export default () => {
  interface iResource extends Pagination {
    data: InvoiceResource[]
  }

  const route = useRoute()

  const invoices = ref<iResource>()
  const load = (page = 1) => {
    window.axios
      .get('/api/v1/invoices', {
        params: {
          company_id: route.params.id,
          page,
        },
      })
      .then(res => (invoices.value = res.data))
  }

  return {
    invoices,
    load,
    route,
  }
}
