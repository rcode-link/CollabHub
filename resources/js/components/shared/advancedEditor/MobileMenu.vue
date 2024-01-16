<script setup lang="ts">

import TextBold from "../icons/TextBold.vue";
import {FwbButton, FwbDropdown, FwbListGroup, FwbListGroupItem} from "flowbite-vue";
import TextItalic from "../icons/TextItalic.vue";
import TextStroke from "../icons/TextStroke.vue";
import {computed} from "vue";
import TableIcon from "../icons/TableIcon.vue";
import CodeIcon from "../icons/CodeIcon.vue";
import BulletListIcon from "../icons/BulletListIcon.vue";
import DiagramIcon from "../icons/DiagramIcon.vue";
import QuoteIcon from "../icons/QuoteIcon.vue";
import OrderedListIcon from "../icons/OrderedListIcon.vue";
import Button from "../Button.vue";

const props = defineProps({
    editor: null
})
const buttonClicked = (e, callback) => {
    e.preventDefault();
    if (!callback) {
        return;
    }
    callback()
}
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
</script>

<template>

    <div
        class="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 dark:bg-gray-700 dark:border-gray-600">
        <div class="grid h-full max-w-lg grid-cols-6 mx-auto font-medium">

            <button type="button"
                    class="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
                    @click="(e) =>  buttonClicked(e, editor.chain().focus().toggleBold().run())"
                    :disabled="!editor.can().chain().focus().toggleBold().run()">
                <TextBold class="w-4 h-4"/>
                Bold
            </button>
            <button type="button"
                    class="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
                    @click="(e) =>  buttonClicked(e, editor.chain().focus().toggleItalic().run())"
                    :disabled="!editor.can().chain().focus().toggleItalic().run()">
                <TextItalic class="w-4 h-4"/>
                Italic
            </button>
            <button type="button"
                    class="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
                    @click="(e) => buttonClicked(e, editor.chain().focus().toggleStrike().run())"
                    :disabled="!editor.can().chain().focus().toggleStrike().run()">
                <TextStroke class="w-4 h-4"/>
                Stroke
            </button>

            <button type="button"
                    class="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 512 512">
                    <title></title>
                    <g id="icomoon-ignore">
                    </g>
                    <path d="M32 256h192v64h-64v192h-64v-192h-64zM480 128h-125.875v384h-68.25v-384h-125.875v-64h320z"></path>
                </svg>
                {{ textTypeTitle }}
            </button>

<!--            <fwb-dropdown text="Bottom" placement="top">-->
<!--                <template #trigger>-->
<!--                    <button type="button"-->
<!--                            class="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"-->
<!--                            @click=" e => buttonClicked(e, null)">-->
<!--                        {{ textTypeTitle }}-->
<!--                    </button>-->
<!--                </template>-->
<!--                <fwb-list-group>-->
<!--                    <fwb-list-group-item class="hover:bg-gray-100 cursor-pointer"-->
<!--                                         @click="(e) => buttonClicked(e, editor.chain().focus().setParagraph().run())"-->
<!--                    >-->
<!--                        Paragraph-->
<!--                    </fwb-list-group-item>-->
<!--                    <fwb-list-group-item class="hover:bg-gray-100 cursor-pointer text-5xl "-->
<!--                                         @click="(e) => buttonClicked(e, editor.chain().focus().toggleHeading({ level: 1 }).run())">-->
<!--                        h1-->
<!--                    </fwb-list-group-item>-->
<!--                    <fwb-list-group-item class="hover:bg-gray-100 cursor-pointer text-4xl "-->
<!--                                         @click="(e) => buttonClicked(e, editor.chain().focus().toggleHeading({ level: 2 }).run())">-->
<!--                        h2-->
<!--                    </fwb-list-group-item>-->
<!--                    <fwb-list-group-item class="hover:bg-gray-100 cursor-pointer text-3xl"-->
<!--                                         @click="(e) => buttonClicked(e, editor.chain().focus().toggleHeading({ level: 3 }).run())">-->
<!--                        h3-->
<!--                    </fwb-list-group-item>-->
<!--                    <fwb-list-group-item class="hover:bg-gray-100 cursor-pointer text-2xl "-->
<!--                                         @click="(e) => buttonClicked(e, editor.chain().focus().toggleHeading({ level: 4 }).run())">-->
<!--                        h4-->
<!--                    </fwb-list-group-item>-->
<!--                    <fwb-list-group-item class="hover:bg-gray-100 cursor-pointer text-xl "-->
<!--                                         @click="(e) => buttonClicked(e, editor.chain().focus().toggleHeading({ level: 5 }).run())">-->
<!--                        h5-->
<!--                    </fwb-list-group-item>-->

<!--                </fwb-list-group>-->
<!--            </fwb-dropdown>-->
            <fwb-dropdown text="Bottom" placement="top">
                <template #trigger>
                    <button type="button"
                            class="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
                            @click=" e => buttonClicked(e, null)">
                        Insert
                    </button>
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
            <fwb-dropdown text="Bottom" placement="top" v-if="editor.isActive('table')">
                <template #trigger>
                    <button type="button"
                            class="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
                            @click=" e => buttonClicked(e, null)">
                        Table
                    </button>
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
            <button type="button"
                    class="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
                    @click=" e => buttonClicked(e, null)">
                Save
            </button>
        </div>
    </div>

</template>

<style scoped>

</style>
