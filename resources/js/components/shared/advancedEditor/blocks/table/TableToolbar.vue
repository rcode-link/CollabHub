<template>
  <div class="table-toolbar">
    <!-- Top toolbar - always visible for basic controls -->
    <div class="top-toolbar" :class="{ 'toolbar-visible': selected }">
      <div class="toolbar-row primary-actions">
        <FwbButton
          :color="isStriped ? 'primary' : 'light'" 
          size="sm"
          @click="editor.commands.toggleTableStriped()"
          title="Toggle striped"
          class="table-action-btn"
        >
          <span class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" width="16" height="16">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5h16M4 9h16M4 13h16M4 17h16"/>
            </svg>
            <span class="ml-1">Striped</span>
          </span>
        </FwbButton>
        
        <FwbButton
          color="red"
          size="sm"
          @click="editor.commands.deleteTable()"
          title="Delete table"
          class="ml-auto table-action-btn"
        >
          <span class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" width="16" height="16">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/>
            </svg>
            <span class="ml-1">Delete</span>
          </span>
        </FwbButton>
      </div>
      
      <!-- Row operations -->
      <div v-if="selected" class="toolbar-row">
        <div class="toolbar-section">
          <div class="toolbar-label">Rows</div>
          <div class="toolbar-buttons">
            <FwbButton
              color="light"
              size="sm"
              @click="editor.commands.addRowBefore()"
              title="Add row above"
              class="table-action-icon-btn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" width="16" height="16">
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 18h16M4 12h16M4 6h16M12 3v3M12 9v3M12 15v3M12 21v3"/>
              </svg>
            </FwbButton>
            
            <FwbButton
              color="light"
              size="sm"
              @click="editor.commands.addRowAfter()"
              title="Add row below"
              class="table-action-icon-btn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" width="16" height="16">
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 18h16M4 12h16M4 6h16M12 3v3M12 9v3M12 15v3M12 21v3"/>
              </svg>
            </FwbButton>
            
            <FwbButton
              color="light"
              size="sm"
              @click="editor.commands.deleteRow()"
              title="Delete row"
              class="table-action-icon-btn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" width="16" height="16">
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18M3 12h18M3 18h18M23 12H1"/>
              </svg>
            </FwbButton>
          </div>
        </div>
        
        <!-- Column operations -->
        <div class="toolbar-section">
          <div class="toolbar-label">Columns</div>
          <div class="toolbar-buttons">
            <FwbButton
              color="light"
              size="sm"
              @click="editor.commands.addColumnBefore()"
              title="Add column before"
              class="table-action-icon-btn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" width="16" height="16">
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 4v16M12 4v16M18 4v16M3 12h18"/>
              </svg>
            </FwbButton>
            
            <FwbButton
              color="light"
              size="sm"
              @click="editor.commands.addColumnAfter()"
              title="Add column after"
              class="table-action-icon-btn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" width="16" height="16">
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 4v16M12 4v16M18 4v16M3 12h18"/>
              </svg>
            </FwbButton>
            
            <FwbButton
              color="light"
              size="sm"
              @click="editor.commands.deleteColumn()"
              title="Delete column"
              class="table-action-icon-btn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" width="16" height="16">
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 3v18M12 3v18M18 3v18M12 3H6M12 21H6"/>
              </svg>
            </FwbButton>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Table content slot -->
    <slot />
    
    <!-- Bottom toolbar -->
    <div class="bottom-toolbar" :class="{ 'toolbar-visible': selected }">
      <div class="toolbar-section">
        <div class="toolbar-label">Insert after table</div>
        <div class="toolbar-buttons">
          <FwbButton
            color="light"
            size="sm"
            @click="editor.commands.addElementAfterTable('paragraph')"
            title="Add text below"
            class="table-action-btn"
          >
            <span class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" width="16" height="16">
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h12"/>
              </svg>
              <span class="ml-1">Text</span>
            </span>
          </FwbButton>
          
          <FwbButton
            color="light"
            size="sm"
            @click="editor.commands.addElementAfterTable('heading')"
            title="Add heading below"
            class="table-action-btn"
          >
            <span class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" width="16" height="16">
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 12h18"/>
              </svg>
              <span class="ml-1">Heading</span>
            </span>
          </FwbButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { FwbButton } from "flowbite-vue";

const props = defineProps({
  editor: {
    type: Object,
    required: true,
  },
  node: {
    type: Object,
    required: true,
  },
  isStriped: {
    type: Boolean,
    default: false,
  },
  selected: {
    type: Boolean,
    default: false,
  }
});
</script>

<style>
.table-toolbar {
  width: 100%;
}

.top-toolbar, .bottom-toolbar {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px;
  background-color: rgb(243, 244, 246);
  border: 1px solid rgb(229, 231, 235);
  transition: all 0.2s ease-in-out;
}

.top-toolbar {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  border-bottom: none;
}

.bottom-toolbar {
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  border-top: none;
}

.toolbar-row {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.toolbar-section {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-right: 12px;
}

.toolbar-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.toolbar-buttons {
  display: flex;
  gap: 4px;
}

.toolbar-visible {
  background-color: rgb(239, 246, 255);
  border-color: rgb(191, 219, 254);
}

.primary-actions {
  padding-bottom: 4px;
}

.table-action-btn {
  transition: all 0.2s ease;
}

.table-action-icon-btn {
  padding: 0.25rem !important;
  height: 28px;
  width: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Animation for toolbar visibility */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.toolbar-visible .toolbar-row:not(.primary-actions) {
  animation: fadeIn 0.3s ease-in-out;
}
</style>