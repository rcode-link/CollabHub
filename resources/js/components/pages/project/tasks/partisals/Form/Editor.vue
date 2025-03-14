<script setup lang="js">
import { ref, watch } from "vue";

import Editor from "../../../../../shared/Editor.vue";
import TextBold from "../../../../../shared/icons/TextBold.vue";
import TextItalic from "../../../../../shared/icons/TextItalic.vue";
import TextStroke from "../../../../../shared/icons/TextStroke.vue";
import BulletListIcon from "../../../../../shared/icons/BulletListIcon.vue";
import OrderedListIcon from "../../../../../shared/icons/OrderedListIcon.vue";
import { FwbButton } from "flowbite-vue";

const editorRef = ref(null);
const props = defineProps(['modelValue']);

const model = ref();

watch(
    () => [props.modelValue, editorRef.value?.editor],
    () => {
        editorRef.value?.editor?.commands.setContent(props.modelValue);
    },
    {
        immediate: true,
    }
);

const emits = defineEmits(['update:modelValue','update:markdown']);

watch(model, () => {
    if (model.value) {
        emits("update:modelValue", model.value);
        
        // Only emit markdown update when we have a value
        if (editorRef.value?.editor?.storage?.markdown) {
            emits(
                "update:markdown",
                editorRef.value.editor.storage.markdown.getMarkdown()
            );
        }
    }
}, { deep: true });
</script>
<template>
    <div class="flex gap-1 items-center mb-2">
        <fwb-button
            :color="
                editorRef?.editor?.isActive('bold') ? 'dark' : 'alternative'
            "
            @click="editorRef?.editor?.chain().focus().toggleBold().run()"
        >
            <TextBold class="w-4 h-4" />
        </fwb-button>
        <fwb-button
            :color="
                editorRef?.editor?.isActive('italic') ? 'dark' : 'alternative'
            "
            @click="editorRef?.editor?.chain().focus().toggleItalic().run()"
        >
            <TextItalic class="w-4 h-4" />
        </fwb-button>
        <fwb-button
            :color="
                editorRef?.editor?.isActive('strike') ? 'dark' : 'alternative'
            "
            @click="editorRef?.editor?.chain().focus().toggleStrike().run()"
        >
            <TextStroke class="w-4 h-4" />
        </fwb-button>
        <fwb-button
            :color="
                editorRef?.editor?.isActive('strike') ? 'dark' : 'alternative'
            "
            @click="editorRef?.editor?.chain().focus().toggleBulletList().run()"
        >
            <BulletListIcon class="w-4 h-4 mr-3" />
        </fwb-button>
        <fwb-button
            :color="
                editorRef?.editor?.isActive('strike') ? 'dark' : 'alternative'
            "
            @click="
                editorRef?.editor?.chain().focus().toggleOrderedList().run()
            "
        >
            <OrderedListIcon class="w-4 h-4 mr-3" />
        </fwb-button>
        <slot name="header"></slot>
    </div>

    <Editor ref="editorRef" v-model="model" css-class="input big-input" />
</template>
