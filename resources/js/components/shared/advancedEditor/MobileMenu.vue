<script setup>
import TextBold from "../icons/TextBold.vue";
import { FwbButton, FwbDropdown, FwbListGroup, FwbListGroupItem, FwbButtonGroup } from "flowbite-vue";
import TextItalic from "../icons/TextItalic.vue";
import TextStroke from "../icons/TextStroke.vue";
import { computed } from "vue";
import TableIcon from "../icons/TableIcon.vue";
import CodeIcon from "../icons/CodeIcon.vue";
import BulletListIcon from "../icons/BulletListIcon.vue";
import DiagramIcon from "../icons/DiagramIcon.vue";
import QuoteIcon from "../icons/QuoteIcon.vue";
import OrderedListIcon from "../icons/OrderedListIcon.vue";
import FloppyDiskIcon from "../icons/FloppyDiskIcon.vue";

const props = defineProps({
    editor: null
});

const buttonClicked = (e, callback) => {
    e.preventDefault();
    if (!callback) {
        return;
    }
    callback();
};

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
];

const textTypeTitle = computed(() => {
    const text = textType.filter(obj => props.editor.isActive(obj.name, obj.param));

    if (text.length === 0) {
        return 'Paragraph';
    }

    return text[0].label;
});

const emit = defineEmits(['save']);

const saveContent = () => {
    emit('save');
};
</script>

<template>
    <div class="fixed bottom-0 left-0 z-50 w-full bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div class="grid grid-cols-6 w-full py-2 px-4">
            <!-- Format buttons -->
            <div class="col-span-3 flex gap-2">
                <fwb-button-group size="xs">
                    <fwb-button
                        :color="editor.isActive('bold') ? 'primary' : 'alternative'"
                        @click="(e) => buttonClicked(e, editor.chain().focus().toggleBold().run())"
                        :disabled="!editor.can().chain().focus().toggleBold().run()"
                    >
                        <TextBold class="w-3 h-3" />
                    </fwb-button>

                    <fwb-button
                        :color="editor.isActive('italic') ? 'primary' : 'alternative'"
                        @click="(e) => buttonClicked(e, editor.chain().focus().toggleItalic().run())"
                        :disabled="!editor.can().chain().focus().toggleItalic().run()"
                    >
                        <TextItalic class="w-3 h-3" />
                    </fwb-button>

                    <fwb-button
                        :color="editor.isActive('strike') ? 'primary' : 'alternative'"
                        @click="(e) => buttonClicked(e, editor.chain().focus().toggleStrike().run())"
                        :disabled="!editor.can().chain().focus().toggleStrike().run()"
                    >
                        <TextStroke class="w-3 h-3" />
                    </fwb-button>
                </fwb-button-group>
            </div>

            <!-- Text type and insert dropdown -->
            <div class="col-span-2 flex gap-2">
                <fwb-dropdown placement="top" trigger="click">
                    <template #trigger>
                        <fwb-button size="xs" color="alternative">
                            {{ textTypeTitle.slice(0,4) }}
                        </fwb-button>
                    </template>
                    <fwb-list-group>
                        <fwb-list-group-item
                            class="hover:bg-gray-100 cursor-pointer"
                            @click="(e) => buttonClicked(e, editor.chain().focus().setParagraph().run())"
                        >
                            Para
                        </fwb-list-group-item>
                        <fwb-list-group-item
                            class="hover:bg-gray-100 cursor-pointer font-bold"
                            @click="(e) => buttonClicked(e, editor.chain().focus().toggleHeading({ level: 1 }).run())"
                        >
                            H1
                        </fwb-list-group-item>
                        <fwb-list-group-item
                            class="hover:bg-gray-100 cursor-pointer font-bold"
                            @click="(e) => buttonClicked(e, editor.chain().focus().toggleHeading({ level: 2 }).run())"
                        >
                            H2
                        </fwb-list-group-item>
                        <fwb-list-group-item
                            class="hover:bg-gray-100 cursor-pointer font-bold"
                            @click="(e) => buttonClicked(e, editor.chain().focus().toggleHeading({ level: 3 }).run())"
                        >
                            H3
                        </fwb-list-group-item>
                    </fwb-list-group>
                </fwb-dropdown>

                <fwb-dropdown placement="top" trigger="click">
                    <template #trigger>
                        <fwb-button size="xs" color="alternative">
                            Insert
                        </fwb-button>
                    </template>
                    <fwb-list-group>
                        <fwb-list-group-item
                            class="hover:bg-gray-100 cursor-pointer"
                            @click="(e) => buttonClicked(e, editor.chain().focus().toggleBlockquote().run())"
                        >
                            <QuoteIcon class="w-3 h-3 mr-1 inline" />
                            Quote
                        </fwb-list-group-item>
                        <fwb-list-group-item
                            class="hover:bg-gray-100 cursor-pointer"
                            @click="(e) => buttonClicked(e, editor.chain().focus().toggleCodeBlock().run())"
                        >
                            <CodeIcon class="w-3 h-3 mr-1 inline" />
                            Code
                        </fwb-list-group-item>
                        <fwb-list-group-item
                            class="hover:bg-gray-100 cursor-pointer"
                            @click="(e) => buttonClicked(e, editor.chain().focus().toggleBulletList().run())"
                        >
                            <BulletListIcon class="w-3 h-3 mr-1 inline" />
                            List
                        </fwb-list-group-item>
                        <fwb-list-group-item
                            class="hover:bg-gray-100 cursor-pointer"
                            @click="(e) => buttonClicked(e, editor.chain().focus().toggleOrderedList().run())"
                        >
                            <OrderedListIcon class="w-3 h-3 mr-1 inline" />
                            Numbered
                        </fwb-list-group-item>
                        <fwb-list-group-item
                            class="hover:bg-gray-100 cursor-pointer"
                            @click="(e) => buttonClicked(e, editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run())"
                        >
                            <TableIcon class="w-3 h-3 mr-1 inline" />
                            Table
                        </fwb-list-group-item>
                    </fwb-list-group>
                </fwb-dropdown>
            </div>

            <!-- Save button -->
            <div class="col-span-1 flex justify-end">
                <fwb-button
                    size="xs"
                    color="primary"
                    @click="saveContent"
                >
                    <FloppyDiskIcon class="w-3 h-3" />
                </fwb-button>
            </div>
        </div>

        <!-- Table actions (conditionally shown) -->
        <div v-if="editor.isActive('table')" class="grid w-full py-2 px-4 border-t border-gray-200 dark:border-gray-700">
            <fwb-button-group size="xs" class="w-full grid grid-cols-2 gap-1">
                <fwb-button color="alternative" @click="(e) => buttonClicked(e, editor.commands.addRowAfter())">
                    + Row
                </fwb-button>
                <fwb-button color="alternative" @click="(e) => buttonClicked(e, editor.commands.addColumnAfter())">
                    + Column
                </fwb-button>
            </fwb-button-group>
        </div>
    </div>
</template>

<style scoped>
.fixed {
    padding-bottom: env(safe-area-inset-bottom);
}
</style>
