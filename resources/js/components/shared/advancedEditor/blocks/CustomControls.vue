<template>
  <div class="block-controls" @mousedown.prevent>
    <button class="block-ctrl-btn" title="Move up" @click.stop="emits('moveUp')">
      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="m18 15-6-6-6 6"/>
      </svg>
    </button>
    <button class="block-ctrl-btn" title="Move down" @click.stop="emits('moveDown')">
      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="m6 9 6 6 6-6"/>
      </svg>
    </button>
    <button class="block-ctrl-btn block-ctrl-delete" title="Delete block" @click.stop="emits('removeNode')">
      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
const emits = defineEmits(['removeNode', 'moveUp', 'moveDown'])
</script>

<style>
.block-controls {
  position: absolute;
  left: -1.75rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 1px;
  opacity: 0;
  transition: opacity 0.12s ease;
  z-index: 10;
}

.block-wrapper:hover .block-controls {
  opacity: 1;
}

.block-ctrl-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 3px;
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  transition: background 0.1s, color 0.1s;
}

.block-ctrl-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.dark .block-ctrl-btn:hover {
  background: #374151;
  color: #d1d5db;
}

.block-ctrl-delete:hover {
  background: #fee2e2 !important;
  color: #ef4444 !important;
}

.dark .block-ctrl-delete:hover {
  background: #450a0a !important;
  color: #fca5a5 !important;
}
</style>
