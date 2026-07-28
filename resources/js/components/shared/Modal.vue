<script setup>
import { ref, watch } from 'vue'

const emit = defineEmits(['closed'])
const props = defineProps({
  hideModal: { type: Boolean, default: false },
  size: { type: String, default: 'md' }, // md | lg | xl | 2xl | 3xl
})

const isOpen = ref(false)

watch(() => props.hideModal, (v) => { isOpen.value = v }, { immediate: true })

const open  = () => { isOpen.value = true }
const close = () => { isOpen.value = false; emit('closed') }
const toggleModal = () => { isOpen.value = !isOpen.value }

defineExpose({ toggleModal, closeModal: close, isShowModal: isOpen })
</script>

<template>
  <!-- Trigger -->
  <span @click="open"><slot name="button" /></span>

  <!-- Backdrop + panel -->
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="close"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="close" />

        <!-- Panel -->
        <div :class="[
          'relative w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]',
          { 'max-w-md': size === 'md', 'max-w-lg': size === 'lg', 'max-w-xl': size === 'xl', 'max-w-2xl': size === '2xl', 'max-w-3xl': size === '3xl' }
        ]">
          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <div class="text-sm font-semibold text-gray-900 dark:text-white">
              <slot name="header" />
            </div>
            <button
              class="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              @click="close"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="px-5 py-4 overflow-y-auto flex-1 text-sm text-gray-700 dark:text-gray-300">
            <slot name="body" />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-2">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.15s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
