<template>
  <div class="table-shell">
    <!-- Toolbar — visible when table is focused -->
    <div v-if="selected" class="table-controls" title="Table options">
      <!-- Row group -->
      <div class="ctrl-group">
        <button class="ctrl-btn" title="Add row above" @click="editor.commands.addRowBefore()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 10h18M3 14h18M12 6V3m0 0-2 2m2-2 2 2"/>
          </svg>
        </button>
        <button class="ctrl-btn" title="Add row below" @click="editor.commands.addRowAfter()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 10h18M3 14h18M12 18v3m0 0 2-2m-2 2-2-2"/>
          </svg>
        </button>
        <button class="ctrl-btn ctrl-btn-danger" title="Delete row" @click="editor.commands.deleteRow()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 10h18M3 14h18M5 18l14-12"/>
          </svg>
        </button>
      </div>

      <div class="ctrl-sep" />

      <!-- Column group -->
      <div class="ctrl-group">
        <button class="ctrl-btn" title="Add column before" @click="editor.commands.addColumnBefore()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 3v18M15 3v18M6 12H3m0 0 2-2m-2 2 2 2"/>
          </svg>
        </button>
        <button class="ctrl-btn" title="Add column after" @click="editor.commands.addColumnAfter()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 3v18M15 3v18M18 12h3m0 0-2-2m2 2-2 2"/>
          </svg>
        </button>
        <button class="ctrl-btn ctrl-btn-danger" title="Delete column" @click="editor.commands.deleteColumn()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 3v18M15 3v18M5 5l14 14"/>
          </svg>
        </button>
      </div>

      <div class="ctrl-sep" />

      <!-- Style -->
      <div class="ctrl-group">
        <button
          :class="['ctrl-btn ctrl-btn-text', isStriped && 'ctrl-btn-active']"
          title="Toggle striped rows"
          @click="editor.commands.toggleTableStriped()"
        >
          Striped
        </button>
      </div>

      <!-- Delete table — pushed right -->
      <button
        class="ctrl-btn ctrl-btn-danger ctrl-btn-text ml-auto"
        title="Delete table"
        @click="editor.commands.deleteTable()"
      >
        Delete table
      </button>
    </div>

    <!-- Table content -->
    <slot />
  </div>
</template>

<script setup>
defineProps({
  editor: { type: Object, required: true },
  node: { type: Object, required: true },
  isStriped: { type: Boolean, default: false },
  selected: { type: Boolean, default: false },
})
</script>

<style scoped>
.table-shell {
  width: 100%;
}

.table-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  margin-bottom: 2px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  flex-wrap: wrap;
}

:global(.dark) .table-controls {
  background: #111827;
  border-color: #374151;
}

.ctrl-group {
  display: flex;
  align-items: center;
  gap: 2px;
}

.ctrl-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 4px;
  color: #6b7280;
  transition: background 0.1s, color 0.1s;
  flex-shrink: 0;
}
.ctrl-btn svg {
  width: 14px;
  height: 14px;
}
.ctrl-btn:hover {
  background: #e5e7eb;
  color: #111827;
}
:global(.dark) .ctrl-btn {
  color: #9ca3af;
}
:global(.dark) .ctrl-btn:hover {
  background: #374151;
  color: #f9fafb;
}
.ctrl-btn-text {
  width: auto;
  padding: 0 8px;
  font-size: 0.75rem;
  font-weight: 500;
}
.ctrl-btn-active {
  background: #eff6ff;
  color: #2563eb;
}
:global(.dark) .ctrl-btn-active {
  background: #1e3a8a;
  color: #93c5fd;
}
.ctrl-btn-danger:hover {
  background: #fee2e2;
  color: #dc2626;
}
:global(.dark) .ctrl-btn-danger:hover {
  background: #450a0a;
  color: #f87171;
}

.ctrl-sep {
  width: 1px;
  height: 16px;
  background: #e5e7eb;
  margin: 0 2px;
  flex-shrink: 0;
}
:global(.dark) .ctrl-sep {
  background: #374151;
}
</style>
