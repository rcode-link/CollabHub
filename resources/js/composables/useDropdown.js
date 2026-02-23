import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core'

/**
 * Reusable dropdown open/close logic with click-outside support.
 *
 * Usage:
 *   const { open, el, toggle, close } = useDropdown()
 *   // bind :ref="el" to the dropdown root element
 *   // bind @click="toggle" to the trigger
 */
export function useDropdown(initialOpen = false) {
    const open = ref(initialOpen)
    const el = ref(null)

    onClickOutside(el, () => {
        open.value = false
    })

    function toggle() {
        open.value = !open.value
    }

    function close() {
        open.value = false
    }

    return { open, el, toggle, close }
}
