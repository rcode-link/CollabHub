<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { FwbButton, FwbButtonGroup, FwbDropdown, FwbListGroup, FwbListGroupItem } from 'flowbite-vue';

// Data from global state
const editorState = computed(() => window.editorBlockState || {});
const isMenuVisible = ref(false);
const selectedBlockElement = ref(null);
const menuPosition = ref({ top: 0, right: 0 });

// Listen for selection changes
onMounted(() => {
  document.addEventListener('editorBlockSelectionChanged', handleSelectionChanged);
  updateMenuPosition();
});

onBeforeUnmount(() => {
  document.removeEventListener('editorBlockSelectionChanged', handleSelectionChanged);
});

// Watch for changes to selected node
watch(() => editorState.value.selectedPos, () => {
  updateMenuPosition();
});

// Track menu visibility
watch(() => editorState.value.isMenuVisible, (newValue) => {
  isMenuVisible.value = newValue;
});

// Handle selection changes
const handleSelectionChanged = (event) => {
  isMenuVisible.value = event.detail.isMenuVisible;
  updateMenuPosition();
};

// Update menu position based on selected block
const updateMenuPosition = () => {
  if (!editorState.value.selectedPos) {
    return;
  }

  // Find the DOM element for the selected block
  setTimeout(() => {
    const blockId = `block-${editorState.value.selectedPos}`;
    const blockElement = document.querySelector(`[data-block-id="${blockId}"]`);

    if (blockElement) {
      selectedBlockElement.value = blockElement;
      const rect = blockElement.getBoundingClientRect();

      menuPosition.value = {
        top: `${rect.top}px`,
        right: `${window.innerWidth - rect.right + 8}px`
      };
    }
  }, 0);
};

// Methods for block operations
const addBlockAfter = () => {
  const editor = editorState.value.editor;
  const node = editorState.value.selectedNode;
  const pos = editorState.value.selectedPos;

  if (!editor || !node || pos === null) return;

  // Add a paragraph after this block
  const nodeEnd = pos + node.nodeSize;
  editor.commands.insertContentAt(nodeEnd, { type: 'paragraph' });

  // Focus the editor at the new paragraph position
  setTimeout(() => {
    editor.commands.focus(nodeEnd + 1);
  }, 0);
};

const deleteBlock = () => {
  const editor = editorState.value.editor;
  const node = editorState.value.selectedNode;
  const pos = editorState.value.selectedPos;

  if (!editor || !node || pos === null) return;

  editor.commands.deleteRange({
    from: pos,
    to: pos + node.nodeSize
  });
};

const duplicateBlock = () => {
  const editor = editorState.value.editor;
  const node = editorState.value.selectedNode;
  const pos = editorState.value.selectedPos;

  if (!editor || !node || pos === null) return;

  const nodeEnd = pos + node.nodeSize;
  const content = editor.state.doc.slice(pos, nodeEnd).content;
  editor.commands.insertContentAt(nodeEnd, content);
};

// Transform methods
const transformToParagraph = () => {
  const editor = editorState.value.editor;
  const pos = editorState.value.selectedPos;

  if (!editor || pos === null) return;

  editor.commands.setNodeSelection(pos);
  editor.commands.setParagraph();
};

const transformToHeading = (level) => {
  const editor = editorState.value.editor;
  const pos = editorState.value.selectedPos;

  if (!editor || pos === null) return;

  editor.commands.setNodeSelection(pos);
  editor.commands.toggleHeading({ level });
};

const transformToBulletList = () => {
  const editor = editorState.value.editor;
  const pos = editorState.value.selectedPos;

  if (!editor || pos === null) return;

  editor.commands.setNodeSelection(pos);
  editor.commands.toggleBulletList();
};

const transformToOrderedList = () => {
  const editor = editorState.value.editor;
  const pos = editorState.value.selectedPos;

  if (!editor || pos === null) return;

  editor.commands.setNodeSelection(pos);
  editor.commands.toggleOrderedList();
};

const transformToCodeBlock = () => {
  const editor = editorState.value.editor;
  const pos = editorState.value.selectedPos;

  if (!editor || pos === null) return;

  editor.commands.setNodeSelection(pos);
  editor.commands.toggleCodeBlock();
};

// Check node type
const isParagraph = computed(() => {
  const node = editorState.value.selectedNode;
  return node && node.type.name === 'paragraph';
});

const isHeading = computed(() => {
  const node = editorState.value.selectedNode;
  return node && node.type.name === 'heading';
});

const isBulletList = computed(() => {
  const node = editorState.value.selectedNode;
  return node && node.type.name === 'bulletList';
});

const isOrderedList = computed(() => {
  const node = editorState.value.selectedNode;
  return node && node.type.name === 'orderedList';
});

const isCodeBlock = computed(() => {
  const node = editorState.value.selectedNode;
  return node && node.type.name === 'codeBlock';
});

const isImage = computed(() => {
  const node = editorState.value.selectedNode;
  return node && (node.type.name === 'image' ||
         (node.type.name === 'doc' && node.content &&
          Array.from(node.content).some(child => child.type?.name === 'image')));
});
</script>

<template>
  <teleport to="body">
    <div
      v-if="isMenuVisible"
      class="block-menu-teleport"
      :style="{
        position: 'fixed',
        top: menuPosition.top,
        right: menuPosition.right,
        zIndex: 9999
      }"
    >
      <div class="block-menu-buttons">
        <fwb-button-group size="xs">
          <!-- Add Block button -->
          <div class="tooltip-container">
            <fwb-button
              color="alternative"
              @click="addBlockAfter"
              @mousedown.prevent
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </fwb-button>
            <span class="tooltip">Add after</span>
          </div>

          <!-- Duplicate button -->
          <div class="tooltip-container">
            <fwb-button
              color="alternative"
              @click="duplicateBlock"
              @mousedown.prevent
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 8H7C5.89543 8 5 8.89543 5 10V18C5 19.1046 5.89543 20 7 20H19C20.1046 20 21 19.1046 21 18V10C21 8.89543 20.1046 8 19 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M17 8V6C17 4.89543 16.1046 4 15 4H3C1.89543 4 1 4.89543 1 6V14C1 15.1046 1.89543 16 3 16H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </fwb-button>
            <span class="tooltip">Duplicate</span>
          </div>

          <!-- Transform dropdown -->
          <fwb-dropdown placement="bottom">
            <template #trigger>
              <fwb-button
                color="alternative"
                @mousedown.prevent
              >
                <span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 18H16M12 6V14M3 14L6 17L9 14M21 10L18 7L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              </fwb-button>
            </template>

            <fwb-list-group>
              <fwb-list-group-item
                @click="transformToParagraph"
                class="hover:bg-gray-100 cursor-pointer"
                :class="{ 'bg-blue-50 dark:bg-blue-900': isParagraph }"
              >
                Paragraph
              </fwb-list-group-item>

              <fwb-list-group-item
                @click="transformToHeading(2)"
                class="hover:bg-gray-100 cursor-pointer font-semibold"
                :class="{ 'bg-blue-50 dark:bg-blue-900': isHeading }"
              >
                Heading
              </fwb-list-group-item>

              <fwb-list-group-item
                @click="transformToBulletList"
                class="hover:bg-gray-100 cursor-pointer"
                :class="{ 'bg-blue-50 dark:bg-blue-900': isBulletList }"
              >
                Bullet List
              </fwb-list-group-item>

              <fwb-list-group-item
                @click="transformToOrderedList"
                class="hover:bg-gray-100 cursor-pointer"
                :class="{ 'bg-blue-50 dark:bg-blue-900': isOrderedList }"
              >
                Ordered List
              </fwb-list-group-item>

              <fwb-list-group-item
                @click="transformToCodeBlock"
                class="hover:bg-gray-100 cursor-pointer"
                :class="{ 'bg-blue-50 dark:bg-blue-900': isCodeBlock }"
              >
                Code Block
              </fwb-list-group-item>
            </fwb-list-group>
          </fwb-dropdown>

          <!-- Image-specific options -->
          <template v-if="isImage">
            <fwb-dropdown placement="bottom">
              <template #trigger>
                <fwb-button
                  color="alternative"
                  @mousedown.prevent
                >
                  <span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M8.5 10C9.32843 10 10 9.32843 10 8.5C10 7.67157 9.32843 7 8.5 7C7.67157 7 7 7.67157 7 8.5C7 9.32843 7.67157 10 8.5 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M21 15L16 10L5 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                </fwb-button>
              </template>

              <fwb-list-group>
                <fwb-list-group-item
                  @click="() => {}"
                  class="hover:bg-gray-100 cursor-pointer"
                >
                  Align Left
                </fwb-list-group-item>

                <fwb-list-group-item
                  @click="() => {}"
                  class="hover:bg-gray-100 cursor-pointer"
                >
                  Align Center
                </fwb-list-group-item>

                <fwb-list-group-item
                  @click="() => {}"
                  class="hover:bg-gray-100 cursor-pointer"
                >
                  Align Right
                </fwb-list-group-item>

                <fwb-list-group-item
                  @click="() => {}"
                  class="hover:bg-gray-100 cursor-pointer"
                >
                  Full Width
                </fwb-list-group-item>

                <fwb-list-group-item
                  @click="() => {}"
                  class="hover:bg-gray-100 cursor-pointer"
                >
                  Half Width
                </fwb-list-group-item>
              </fwb-list-group>
            </fwb-dropdown>
          </template>

          <!-- Delete button -->
          <div class="tooltip-container">
            <fwb-button
              color="alternative"
              @click="deleteBlock"
              @mousedown.prevent
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </fwb-button>
            <span class="tooltip">Delete</span>
          </div>
        </fwb-button-group>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.block-menu-buttons {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 0 0 1px rgba(15, 15, 15, 0.1), 0 2px 4px rgba(15, 15, 15, 0.1);
  padding: 2px 4px;
}

.tooltip-container {
  position: relative;
  display: inline-block;
}

.tooltip {
  visibility: hidden;
  width: auto;
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  text-align: center;
  border-radius: 4px;
  padding: 5px 8px;
  position: absolute;
  z-index: 100;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 12px;
  white-space: nowrap;
}

.tooltip-container:hover .tooltip {
  visibility: visible;
  opacity: 1;
}

/* Arrow for the tooltip */
.tooltip::after {
  content: "";
  position: absolute;
  top: -5px;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: transparent transparent rgba(0, 0, 0, 0.8) transparent;
}

/* Dark mode support */
.dark .block-menu-buttons {
  background-color: #374151;
  color: #D1D5DB;
}
</style>
