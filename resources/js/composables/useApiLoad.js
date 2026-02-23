import { ref } from 'vue'

/**
 * Reusable composable for loading data from an API endpoint.
 *
 * Usage:
 *   const { data, loading, error, load } = useApiLoad('/api/v1/users')
 *   await load()                          // manual trigger
 *   await load({ params: { page: 2 } })  // with axios config
 */
export function useApiLoad(url, options = {}) {
    const data = ref(options.default ?? null)
    const loading = ref(false)
    const error = ref(null)

    async function load(axiosConfig = {}) {
        loading.value = true
        error.value = null
        try {
            const res = await window.axios.get(url, axiosConfig)
            data.value = res.data
        } catch (err) {
            error.value = err
        } finally {
            loading.value = false
        }
    }

    if (options.immediate) {
        load()
    }

    return { data, loading, error, load }
}
