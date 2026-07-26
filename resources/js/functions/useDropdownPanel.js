import { ref, watch, nextTick, onBeforeUnmount } from 'vue'

/**
 * Positions a teleported dropdown panel against its trigger using fixed
 * coordinates, so ancestors with overflow-hidden (cards, modals) can't clip it.
 * Flips the panel above the trigger when there isn't enough room below.
 */
export function useDropdownPanel(isOpen, triggerRef, panelRef, onClose) {
    const panelStyle = ref({})
    let resizeObserver = null

    const updatePosition = () => {
        const trigger = triggerRef.value
        const panel = panelRef.value
        if (!trigger || !panel) return
        const rect = trigger.getBoundingClientRect()
        const panelHeight = panel.offsetHeight
        const spaceBelow = window.innerHeight - rect.bottom
        const openUp = spaceBelow < panelHeight + 8 && rect.top > spaceBelow
        panelStyle.value = {
            position: 'fixed',
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            top: openUp
                ? `${Math.max(8, rect.top - panelHeight - 4)}px`
                : `${rect.bottom + 4}px`,
        }
    }

    const onClickOutside = (e) => {
        if (triggerRef.value?.contains(e.target)) return
        if (panelRef.value?.contains(e.target)) return
        onClose()
    }

    const onKeydown = (e) => {
        if (e.key === 'Escape') onClose()
    }

    const teardown = () => {
        document.removeEventListener('mousedown', onClickOutside)
        document.removeEventListener('keydown', onKeydown)
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
        resizeObserver?.disconnect()
        resizeObserver = null
    }

    watch(isOpen, (open) => {
        if (open) {
            nextTick(() => {
                updatePosition()
                if (panelRef.value) {
                    resizeObserver = new ResizeObserver(updatePosition)
                    resizeObserver.observe(panelRef.value)
                }
            })
            document.addEventListener('mousedown', onClickOutside)
            document.addEventListener('keydown', onKeydown)
            window.addEventListener('scroll', updatePosition, true)
            window.addEventListener('resize', updatePosition)
        } else {
            teardown()
        }
    })

    onBeforeUnmount(teardown)

    return { panelStyle, updatePosition }
}
