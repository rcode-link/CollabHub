<script setup>
import EmojiPicker from 'vue3-emoji-picker'
import { h, ref, render, onMounted, onBeforeUnmount } from 'vue'
import { tippy } from 'vue-tippy'

const emits = defineEmits(['select'])

const trigger = ref(null)
let instance = null
let holder = null

const onSelectEmoji = e => {
    emits('select', e)
    instance?.hide()
}

onMounted(() => {
    holder = document.createElement('div')
    render(
        h(EmojiPicker, {
            native: true,
            theme: localStorage.getItem('color-theme') === 'dark' ? 'dark' : 'light',
            onSelect: onSelectEmoji,
        }),
        holder,
    )

    instance = tippy(trigger.value, {
        content: holder,
        appendTo: () => document.body,
        interactive: true,
        trigger: 'click',
        placement: 'auto-end',
        theme: 'mention',
        arrow: false,
        maxWidth: 'none',
        zIndex: 99999,
    })
})

onBeforeUnmount(() => {
    instance?.destroy()
    if (holder) render(null, holder)
    instance = null
    holder = null
})
</script>

<template>
    <div class="relative flex justify-center items-center">
        <label ref="trigger" class="cursor-pointer" @click.prevent>
            <svg class="w-4 h-4" aria-hidden="true" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M10 19C14.9706 19 19 14.9706 19 10C19 5.02944 14.9706 1 10 1C5.02944 1 1 5.02944 1 10C1 14.9706 5.02944 19 10 19Z"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M15 11C15 13.038 12.761 15.5 10 15.5C7.239 15.5 5 13.038 5 11C5 12.444 15 12.444 15 11Z"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path
                    d="M6.5 8C7.32843 8 8 7.32843 8 6.5C8 5.67157 7.32843 5 6.5 5C5.67157 5 5 5.67157 5 6.5C5 7.32843 5.67157 8 6.5 8Z"
                    fill="currentColor" />
                <path
                    d="M13.5 8C14.3284 8 15 7.32843 15 6.5C15 5.67157 14.3284 5 13.5 5C12.6716 5 12 5.67157 12 6.5C12 7.32843 12.6716 8 13.5 8Z"
                    fill="currentColor" />
            </svg>
        </label>
    </div>
</template>

<style scoped></style>
