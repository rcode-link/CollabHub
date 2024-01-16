<script setup lang="ts">

import OrderedListIcon from "../icons/OrderedListIcon.vue";
import QuoteIcon from "../icons/QuoteIcon.vue";
import {FwbButton, FwbDropdown, FwbListGroup, FwbListGroupItem} from "flowbite-vue";
import TextBold from "../icons/TextBold.vue";
import CodeIcon from "../icons/CodeIcon.vue";
import BulletListIcon from "../icons/BulletListIcon.vue";
import RedoIcon from "../icons/RedoIcon.vue";
import TextStroke from "../icons/TextStroke.vue";
import DiagramIcon from "../icons/DiagramIcon.vue";
import TextItalic from "../icons/TextItalic.vue";
import UndoIcon from "../icons/UndoIcon.vue";
import TableIcon from "../icons/TableIcon.vue";
import {computed} from "vue";

const props = defineProps({
  editor: null
})
const textType = [
  {
    label: 'Paragraph',
    name: 'paragraph',
    param: {}
  },
  {
    label: 'Heading 1',
    name: 'heading',
    param: {level: 1}
  },
  {
    label: 'Heading 2',
    name: 'heading',
    param: {level: 2}
  },
  {
    label: 'Heading 3',
    name: 'heading',
    param: {level: 3}
  },
  {
    label: 'Heading 4',
    name: 'heading',
    param: {level: 4}
  },
  {
    label: 'Heading 5',
    name: 'heading',
    param: {level: 5}
  }
]

const textTypeTitle = computed(() => {
  const text = textType.filter(obj => props.editor.isActive(obj.name, obj.param));

  if (text.length === 0) {
    return 'Paragraph'
  }

  return text[0].label;

})

const buttonClicked = (e, callback) => {
  e.preventDefault();
  if (!callback) {
    return;
  }
  callback()
}

</script>

<template>
  <fwb-button :color="editor.isActive('bold') ? 'dark' : 'alternative'"
              @click="(e) =>  buttonClicked(e, editor.chain().focus().toggleBold().run())"
              :disabled="!editor.can().chain().focus().toggleBold().run()">
    <TextBold class="w-4 h-4"/>
  </fwb-button>
  <fwb-button :color="editor.isActive('italic') ? 'dark' : 'alternative'"
              @click="(e) =>  buttonClicked(e, editor.chain().focus().toggleItalic().run())"
              :disabled="!editor.can().chain().focus().toggleItalic().run()">
    <TextItalic class="w-4 h-4"/>
  </fwb-button>
  <fwb-button
      :color="editor.isActive('strike') ? 'dark' : 'alternative'"
      @click="(e) => buttonClicked(e, editor.chain().focus().toggleStrike().run())"
      :disabled="!editor.can().chain().focus().toggleStrike().run()">
    <TextStroke class="w-4 h-4"/>
  </fwb-button>
  <fwb-dropdown text="Bottom">
    <template #trigger>
      <fwb-button
          @click=" e => buttonClicked(e, null)"
          color="alternative"
                  class="min-w-[150px]">
        {{ textTypeTitle }}
      </fwb-button>
    </template>
    <fwb-list-group>
      <fwb-list-group-item class="hover:bg-gray-100 cursor-pointer"
                           @click="(e) => buttonClicked(e, editor.chain().focus().setParagraph().run())"
      >
        paragraph

      </fwb-list-group-item>
      <fwb-list-group-item class="hover:bg-gray-100 cursor-pointer text-5xl "
                           @click="(e) => buttonClicked(e, editor.chain().focus().toggleHeading({ level: 1 }).run())">
        h1
      </fwb-list-group-item>
      <fwb-list-group-item class="hover:bg-gray-100 cursor-pointer text-4xl "
                           @click="(e) => buttonClicked(e, editor.chain().focus().toggleHeading({ level: 2 }).run())">
        h2
      </fwb-list-group-item>
      <fwb-list-group-item class="hover:bg-gray-100 cursor-pointer text-3xl"
                           @click="(e) => buttonClicked(e, editor.chain().focus().toggleHeading({ level: 3 }).run())">
        h3
      </fwb-list-group-item>
      <fwb-list-group-item class="hover:bg-gray-100 cursor-pointer text-2xl "
                           @click="(e) => buttonClicked(e, editor.chain().focus().toggleHeading({ level: 4 }).run())">
        h4
      </fwb-list-group-item>
      <fwb-list-group-item class="hover:bg-gray-100 cursor-pointer text-xl "
                           @click="(e) => buttonClicked(e, editor.chain().focus().toggleHeading({ level: 5 }).run())">
        h5
      </fwb-list-group-item>

    </fwb-list-group>
  </fwb-dropdown>
  <fwb-dropdown>
    <template #trigger>
      <fwb-button  @click=" e => buttonClicked(e, null)" color="alternative">
        Insert
      </fwb-button>
    </template>
    <fwb-list-group>

      <fwb-list-group-item class="hover:bg-gray-100 cursor-pointer"
                           @click="(e) => buttonClicked(e, editor.chain().focus().toggleBlockquote().run())"
      >
        <QuoteIcon class="w-4 h-4 mr-3"/>
        Quote
      </fwb-list-group-item>
      <fwb-list-group-item class="hover:bg-gray-100 cursor-pointer"
                           @click="(e) => buttonClicked(e, editor.chain().focus().toggleCodeBlock().run())"
      >
        <CodeIcon class="w-4 h-4 mr-3"/>
        Code
      </fwb-list-group-item>
      <fwb-list-group-item class="hover:bg-gray-100 cursor-pointer"
                           @click="(e) => buttonClicked(e, editor.commands.insertDrawIo())"
      >
        <DiagramIcon class="w-4 h-4 mr-3"/>
        Drawio
      </fwb-list-group-item>
      <fwb-list-group-item class="hover:bg-gray-100 cursor-pointer"
                           :color="editor.isActive('bulletList') ? 'dark' : 'alternative'"
                           @click="(e) => buttonClicked(e, editor.chain().focus().toggleBulletList().run())">
        <BulletListIcon class="w-4 h-4 mr-3"/>
        Bullet list
      </fwb-list-group-item>
      <fwb-list-group-item class="hover:bg-gray-100 cursor-pointer"
                           :color="editor.isActive('orderedList') ? 'dark' : 'alternative'"
                           @click="(e) => buttonClicked(e, editor.chain().focus().toggleOrderedList().run())"
      >
        <OrderedListIcon class="w-4 h-4 mr-3"/>
        Ordered list
      </fwb-list-group-item>
      <fwb-list-group-item class="hover:bg-gray-100 cursor-pointer"
                           @click="(e) => buttonClicked(e, editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run())"
      >
        <TableIcon class="w-4 h-4 mr-3"/>
        Insert table
      </fwb-list-group-item>
    </fwb-list-group>
  </fwb-dropdown>
  <fwb-dropdown v-if="editor.isActive('table')">
    <template #trigger>
      <fwb-button @click=" e => buttonClicked(e, null)" color="alternative">
        <TableIcon class="w-4 h-4"/>
      </fwb-button>
    </template>
    <fwb-list-group>
      <fwb-list-group-item class="hover:bg-gray-100 cursor-pointer"

                           @click="(e) => buttonClicked(e, editor.commands.addRowAfter())"
      >
        Add row after cursor
      </fwb-list-group-item>
      <fwb-list-group-item class="hover:bg-gray-100 cursor-pointer"

                           @click="(e) => buttonClicked(e, editor.commands.addRowBefore())"
      >
        Add row before cursor
      </fwb-list-group-item>
      <fwb-list-group-item class="hover:bg-gray-100 cursor-pointer"

                           @click="(e) => buttonClicked(e, editor.commands.addColumnAfter())"
      >
        Add column after cursor
      </fwb-list-group-item>
      <fwb-list-group-item class="hover:bg-gray-100 cursor-pointer"

                           @click="(e) => buttonClicked(e, editor.commands.addColumnBefore())"
      >
        Add column before cursor
      </fwb-list-group-item>

    </fwb-list-group>
  </fwb-dropdown>


  <fwb-button
      color="alternative"
      @click="(e) => buttonClicked(e, editor.chain().focus().undo().run())"
      :disabled="!editor.can().chain().focus().undo().run()"
  >
    <RedoIcon class="w-4 h-4"/>
  </fwb-button>
  <fwb-button
      class="ml-1"
      color="alternative" @click="(e) => buttonClicked(e, editor.chain().focus().redo().run())"
      :disabled="!editor.can().chain().focus().redo().run()">
    <UndoIcon class="w-4 h-4"/>
  </fwb-button>
</template>

<style scoped>
button {
  height: 34px;
}
</style>
