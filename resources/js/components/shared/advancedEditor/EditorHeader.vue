<script setup>
import OrderedListIcon from "../icons/OrderedListIcon.vue";
import QuoteIcon from "../icons/QuoteIcon.vue";

import {
  FwbButton,
  FwbDropdown,
  FwbListGroup,
  FwbListGroupItem,
  FwbButtonGroup,
} from "flowbite-vue";
import TextBold from "../icons/TextBold.vue";
import CodeIcon from "../icons/CodeIcon.vue";
import BulletListIcon from "../icons/BulletListIcon.vue";
import RedoIcon from "../icons/RedoIcon.vue";
import TextStroke from "../icons/TextStroke.vue";
import DiagramIcon from "../icons/DiagramIcon.vue";
import TextItalic from "../icons/TextItalic.vue";
import UndoIcon from "../icons/UndoIcon.vue";
import TableIcon from "../icons/TableIcon.vue";
import { computed, ref, onMounted, watch } from "vue";

const props = defineProps({
  editor: null,
});

const isTableSelected = ref(false);

// Watch for changes in editor state to correctly detect table
watch(
  () => props.editor?.state?.selection,
  () => {
    if (!props.editor) return;
    updateTableState();
  },
  { deep: true }
);

// Also check whenever the component is updated
onMounted(() => {
  if (props.editor) {
    updateTableState();
  }
});

// Function to check if we're inside a table
const updateTableState = () => {
  if (!props.editor) return;

  // Use the editor's state to find if we're in a table node
  const { state } = props.editor;
  let currentNode = state.selection.$anchor.parent;
  let depth = state.selection.$anchor.depth;

  // Walk up the node tree to find if we're in a table
  isTableSelected.value = false;

  while (depth > 0 && !isTableSelected.value) {
    if (currentNode.type.name === "table") {
      isTableSelected.value = true;
      break;
    }
    depth--;
    currentNode = state.selection.$anchor.node(depth);
  }

  // Alternative approach using the editor's isActive method
  if (!isTableSelected.value) {
    isTableSelected.value = props.editor.isActive("table");
  }
};

const addImage = function () {
  const url = window.prompt("URL");

  if (url) {
    props.editor
      .chain()
      .focus()
      .setImage({
        src: url,
        alt: "Random image",
        title: "Random image from Unsplash",
      })
      .run();
  }
};
const textType = [
  {
    label: "Paragraph",
    name: "paragraph",
    param: {},
  },
  {
    label: "Heading 1",
    name: "heading",
    param: { level: 1 },
  },
  {
    label: "Heading 2",
    name: "heading",
    param: { level: 2 },
  },
  {
    label: "Heading 3",
    name: "heading",
    param: { level: 3 },
  },
  {
    label: "Heading 4",
    name: "heading",
    param: { level: 4 },
  },
  {
    label: "Heading 5",
    name: "heading",
    param: { level: 5 },
  },
];

const textTypeTitle = computed(() => {
  const text = textType.filter((obj) =>
    props.editor.isActive(obj.name, obj.param)
  );

  if (text.length === 0) {
    return "Paragraph";
  }

  return text[0].label;
});

const buttonClicked = (e, callback) => {
  e?.preventDefault();
  if (typeof callback !== "object" || callback === null) {
    return;
  }
  callback();
};

// Log whenever table state changes (for debugging)
watch(isTableSelected, (newVal) => {
  console.log("Table selected:", newVal);
});
</script>

<template>
  <div class="editor-toolbar p-2 flex flex-wrap items-center gap-2 bg-white border border-gray-200 rounded-t-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
    <!-- Text Formatting Button Group -->
    <fwb-button-group>
      <div class="tooltip-container">
        <fwb-button
          :color="editor.isActive('bold') ? 'primary' : 'alternative'"
          size="sm"
          @click="(e) => buttonClicked(e, editor.chain().focus().toggleBold().run())"
          :disabled="!editor.can().chain().focus().toggleBold().run()"
        >
          <div class="flex justify-center items-center">
            <TextBold class="w-4 h-4" />
          </div>
        </fwb-button>
        <span class="tooltip">Bold</span>
      </div>

      <div class="tooltip-container">
        <fwb-button
          :color="editor.isActive('italic') ? 'primary' : 'alternative'"
          size="sm"
          @click="(e) => buttonClicked(e, editor.chain().focus().toggleItalic().run())"
          :disabled="!editor.can().chain().focus().toggleItalic().run()"
        >
          <div class="flex justify-center items-center">
            <TextItalic class="w-4 h-4" />
          </div>
        </fwb-button>
        <span class="tooltip">Italic</span>
      </div>

      <div class="tooltip-container">
        <fwb-button
          :color="editor.isActive('strike') ? 'primary' : 'alternative'"
          size="sm"
          @click="(e) => buttonClicked(e, editor.chain().focus().toggleStrike().run())"
          :disabled="!editor.can().chain().focus().toggleStrike().run()"
        >
          <div class="flex justify-center items-center">
            <TextStroke class="w-4 h-4" />
          </div>
        </fwb-button>
        <span class="tooltip">Strikethrough</span>
      </div>
    </fwb-button-group>

    <!-- Text Style Dropdown -->
    <fwb-dropdown placement="bottom">
      <template #trigger>
        <fwb-button
          @click="(e) => buttonClicked(e, null)"
          color="alternative"
          size="sm"
          class="min-w-[120px]"
        >
          <div class="flex justify-center items-center">
            <span>{{ textTypeTitle }}</span>
            <svg
              class="w-4 h-4 ml-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
          </div>
        </fwb-button>
      </template>
      <fwb-list-group>
        <fwb-list-group-item
          class="hover:bg-gray-100 cursor-pointer"
          @click="(e) => buttonClicked(e, editor.chain().focus().setParagraph().run())"
        >
          Paragraph
        </fwb-list-group-item>
        <fwb-list-group-item
          class="hover:bg-gray-100 cursor-pointer text-2xl font-bold"
          @click="(e) => buttonClicked(e, editor.chain().focus().toggleHeading({ level: 1 }).run())"
        >
          Heading 1
        </fwb-list-group-item>
        <fwb-list-group-item
          class="hover:bg-gray-100 cursor-pointer text-xl font-bold"
          @click="(e) => buttonClicked(e, editor.chain().focus().toggleHeading({ level: 2 }).run())"
        >
          Heading 2
        </fwb-list-group-item>
        <fwb-list-group-item
          class="hover:bg-gray-100 cursor-pointer text-lg font-bold"
          @click="(e) => buttonClicked(e, editor.chain().focus().toggleHeading({ level: 3 }).run())"
        >
          Heading 3
        </fwb-list-group-item>
        <fwb-list-group-item
          class="hover:bg-gray-100 cursor-pointer text-base font-bold"
          @click="(e) => buttonClicked(e, editor.chain().focus().toggleHeading({ level: 4 }).run())"
        >
          Heading 4
        </fwb-list-group-item>
        <fwb-list-group-item
          class="hover:bg-gray-100 cursor-pointer text-sm font-bold"
          @click="(e) => buttonClicked(e, editor.chain().focus().toggleHeading({ level: 5 }).run())"
        >
          Heading 5
        </fwb-list-group-item>
      </fwb-list-group>
    </fwb-dropdown>

    <!-- Insert Dropdown -->
    <fwb-dropdown placement="bottom">
      <template #trigger>
        <fwb-button
          @click="(e) => buttonClicked(e, null)"
          color="alternative"
          size="sm"
        >
          <div class="flex justify-center items-center">
            <span>Insert</span>
            <svg
              class="w-4 h-4 ml-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
          </div>
        </fwb-button>
      </template>
      <fwb-list-group>
        <fwb-list-group-item
          class="hover:bg-gray-100 cursor-pointer flex items-center"
          @click="(e) => buttonClicked(e, editor.chain().focus().toggleBlockquote().run())"
        >
          <div class="flex items-center">
            <QuoteIcon class="w-4 h-4 mr-2" />
            Quote
          </div>
        </fwb-list-group-item>
        <fwb-list-group-item
          class="hover:bg-gray-100 cursor-pointer flex items-center"
          @click="(e) => buttonClicked(e, editor.chain().focus().toggleCodeBlock().run())"
        >
          <div class="flex items-center">
            <CodeIcon class="w-4 h-4 mr-2" />
            Code
          </div>
        </fwb-list-group-item>
        <fwb-list-group-item
          class="hover:bg-gray-100 cursor-pointer flex items-center"
          @click="addImage"
        >
          <div class="flex items-center">
            <DiagramIcon class="w-4 h-4 mr-2" />
            Image
          </div>
        </fwb-list-group-item>

        <fwb-list-group-item
          class="hover:bg-gray-100 cursor-pointer flex items-center"
          @click="(e) => buttonClicked(e, editor.commands.insertDrawIo())"
        >
          <div class="flex items-center">
            <DiagramIcon class="w-4 h-4 mr-2" />
            Diagram
          </div>
        </fwb-list-group-item>
        <fwb-list-group-item
          class="hover:bg-gray-100 cursor-pointer flex items-center"
          :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('bulletList') }"
          @click="(e) => buttonClicked(e, editor.chain().focus().toggleBulletList().run())"
        >
          <div class="flex items-center">
            <BulletListIcon class="w-4 h-4 mr-2" />
            Bullet List
          </div>
        </fwb-list-group-item>
        <fwb-list-group-item
          class="hover:bg-gray-100 cursor-pointer flex items-center"
          :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('orderedList') }"
          @click="(e) => buttonClicked(e, editor.chain().focus().toggleOrderedList().run())"
        >
          <div class="flex items-center">
            <OrderedListIcon class="w-4 h-4 mr-2" />
            Ordered List
          </div>
        </fwb-list-group-item>
        <fwb-list-group-item
          class="hover:bg-gray-100 cursor-pointer flex items-center"
          @click="(e) => buttonClicked(e, editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run())"
        >
          <div class="flex items-center">
            <TableIcon class="w-4 h-4 mr-2" />
            Table
          </div>
        </fwb-list-group-item>
      </fwb-list-group>
    </fwb-dropdown>


    <!-- Table Controls Dropdown -->
    <!-- Using our custom isTableSelected computed property instead of editor.isActive('table') -->
    <fwb-dropdown
      v-if="editor.isActive('table')"
      placement="bottom"
    >
      <template #trigger>
        <fwb-button
          @click="(e) => buttonClicked(e, null)"
          color="alternative"
          size="sm"
          class="bg-blue-100 border-blue-300 dark:bg-blue-900 dark:border-blue-700"
        >
          <div class="flex justify-center items-center">
            <TableIcon class="w-4 h-4" />
          </div>
        </fwb-button>
      </template>
      <fwb-list-group>
        <fwb-list-group-item
          class="hover:bg-gray-100 cursor-pointer"
          @click="(e) => buttonClicked(e, editor.commands.toggleTableStriped())"
        >
                    Stripped style
        </fwb-list-group-item>

        <fwb-list-group-item
          class="hover:bg-gray-100 cursor-pointer"
          @click="(e) => buttonClicked(e, editor.commands.addRowAfter())"
        >
          Add row after
        </fwb-list-group-item>
        <fwb-list-group-item
          class="hover:bg-gray-100 cursor-pointer"
          @click="(e) => buttonClicked(e, editor.commands.addRowBefore())"
        >
          Add row before
        </fwb-list-group-item>
        <fwb-list-group-item
          class="hover:bg-gray-100 cursor-pointer"
          @click="(e) => buttonClicked(e, editor.commands.addColumnAfter())"
        >
          Add column after
        </fwb-list-group-item>
        <fwb-list-group-item
          class="hover:bg-gray-100 cursor-pointer"
          @click="(e) => buttonClicked(e, editor.commands.addColumnBefore())"
        >
          Add column before
        </fwb-list-group-item>

        <!-- New commands for our improved table extension -->
        <fwb-list-group-item
          class="hover:bg-gray-100 cursor-pointer"
          @click="(e) => buttonClicked(e, editor.commands.setTableWidth('75%'))"
        >
          Set width to 75%
        </fwb-list-group-item>
        <fwb-list-group-item
          class="hover:bg-gray-100 cursor-pointer"
          @click="(e) => buttonClicked(e, editor.commands.setTableWidth('100%'))"
        >
          Set width to 100%
        </fwb-list-group-item>
        <fwb-list-group-item
          class="hover:bg-gray-100 cursor-pointer"
          @click="(e) => buttonClicked(e, editor.commands.setTableBackgroundColor('#f3f4f6'))"
        >
          Light gray background
        </fwb-list-group-item>
        <fwb-list-group-item
          class="hover:bg-gray-100 cursor-pointer"
          @click="(e) => buttonClicked(e, editor.commands.setTableBackgroundColor(null))"
        >
          Remove background
        </fwb-list-group-item>
        <fwb-list-group-item
          class="hover:bg-gray-100 cursor-pointer text-red-500"
          @click="(e) => buttonClicked(e, editor.commands.deleteTable())"
        >
          Delete table
        </fwb-list-group-item>
      </fwb-list-group>
    </fwb-dropdown>

    <!-- History Controls -->
    <div class="ml-auto">
      <fwb-button-group>

        <div class="tooltip-container">
          <fwb-button
            color="alternative"
            size="sm"
            @click="(e) => buttonClicked(e, editor.chain().focus().undo().run())"
            :disabled="!editor.can().chain().focus().undo().run()"
          >
            <div class="flex justify-center items-center">

              <RedoIcon class="w-4 h-4" />
            </div>
          </fwb-button>
          <span class="tooltip">Undo</span>
        </div>

        <div class="tooltip-container">
          <fwb-button
            color="alternative"
            size="sm"
            @click="(e) => buttonClicked(e, editor.chain().focus().redo().run())"
            :disabled="!editor.can().chain().focus().redo().run()"
          >
            <div class="flex justify-center items-center">
              <UndoIcon class="w-4 h-4" />
            </div>
          </fwb-button>
          <span class="tooltip">Redo</span>
        </div>

      </fwb-button-group>
    </div>
  </div>
</template>

<style scoped>
.editor-toolbar {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
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
  z-index: 1;
  bottom: 125%;
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
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.8) transparent transparent transparent;
}
</style>
