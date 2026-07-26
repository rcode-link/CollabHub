<script setup>
import { ref, computed, nextTick } from 'vue'
import { useDropdownPanel } from '@/functions/useDropdownPanel'

const props = defineProps({
    modelValue: { default: '' },
    options: { type: Array, default: () => [] },
    placeholder: { type: String, default: 'Select...' },
    searchPlaceholder: { type: String, default: 'Search...' },
    disabled: { type: Boolean, default: false },
    size: { type: String, default: 'md' },
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const search = ref('')
const searchInput = ref(null)
const container = ref(null)
const panel = ref(null)

const { panelStyle } = useDropdownPanel(isOpen, container, panel, () => {
    isOpen.value = false
})

const filteredOptions = computed(() => {
    if (!search.value) return props.options
    const q = search.value.toLowerCase()
    return props.options.filter(o => o.label.toLowerCase().includes(q))
})

const selectedLabel = computed(() => {
    const found = props.options.find(o => String(o.value) === String(props.modelValue))
    return found ? found.label : ''
})

const toggle = () => {
    if (props.disabled) return
    isOpen.value = !isOpen.value
    if (isOpen.value) {
        search.value = ''
        nextTick(() => searchInput.value?.focus())
    }
}

const select = (option) => {
    emit('update:modelValue', option.value)
    isOpen.value = false
    search.value = ''
}

const clear = () => {
    emit('update:modelValue', '')
    isOpen.value = false
    search.value = ''
}

</script>

<template>
    <div ref="container" class="relative">
        <button
            type="button"
            :disabled="disabled"
            @click="toggle"
            :class="[
                'w-full rounded-lg border bg-white dark:bg-gray-700 text-left flex items-center justify-between',
                'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors',
                size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm',
                disabled
                    ? 'border-gray-200 dark:border-gray-600 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 dark:border-gray-600 cursor-pointer',
            ]"
        >
            <span
                :class="selectedLabel
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-400 dark:text-gray-500'"
            >
                {{ selectedLabel || placeholder }}
            </span>
            <div class="flex items-center gap-1 ml-2 shrink-0">
                <svg
                    v-if="modelValue"
                    @click.stop="clear"
                    class="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <svg
                    class="w-4 h-4 text-gray-400 transition-transform"
                    :class="{ 'rotate-180': isOpen }"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </button>

        <Teleport to="body">
            <div
                v-show="isOpen"
                ref="panel"
                :style="panelStyle"
                class="z-[100] bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden"
            >
            <div class="p-2">
                <input
                    ref="searchInput"
                    v-model="search"
                    type="text"
                    :placeholder="searchPlaceholder"
                    class="w-full rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-2.5 py-1.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>
            <div class="max-h-48 overflow-y-auto">
                <button
                    v-for="option in filteredOptions"
                    :key="option.value"
                    type="button"
                    @click="select(option)"
                    class="flex items-center w-full px-3 py-2 text-sm text-left transition-colors"
                    :class="String(option.value) === String(modelValue)
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'"
                >
                    <span class="truncate">{{ option.label }}</span>
                    <svg
                        v-if="String(option.value) === String(modelValue)"
                        class="w-4 h-4 ml-auto text-blue-500 shrink-0"
                        viewBox="0 0 20 20" fill="currentColor"
                    >
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                </button>
                <div
                    v-if="!filteredOptions.length"
                    class="px-3 py-4 text-sm text-center text-gray-400 dark:text-gray-500"
                >
                    No results found
                </div>
            </div>
            </div>
        </Teleport>
    </div>
</template>
