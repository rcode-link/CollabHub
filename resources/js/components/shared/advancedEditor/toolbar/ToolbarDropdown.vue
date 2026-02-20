<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const open = ref(false)
const toggle = () => { open.value = !open.value }
const close = () => { open.value = false }

onMounted(() => document.addEventListener('click', close))
onUnmounted(() => document.removeEventListener('click', close))
</script>

<template>
  <div class="tb-dropdown-root" @click.stop>
    <!-- Trigger slot -->
    <button class="tb-pill" @click="toggle">
      <slot name="trigger" />
    </button>

    <!-- Items -->
    <div v-if="open" class="tb-dropdown-panel">
      <slot :close="close" />
    </div>
  </div>
</template>

<style>
.tb-dropdown-root { position: relative; }

.tb-pill {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 8px;
  border-radius: 5px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  white-space: nowrap;
  transition: background 0.1s, color 0.1s;
  flex-shrink: 0;
  background: transparent;
  border: none;
  cursor: pointer;
}
.tb-pill:hover { background: #f3f4f6; color: #111827; }
.dark .tb-pill { color: #9ca3af; }
.dark .tb-pill:hover { background: #374151; color: #f9fafb; }

.tb-dropdown-panel {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 50;
  min-width: 168px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.dark .tb-dropdown-panel {
  background: #1f2937;
  border-color: #374151;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
}
</style>
