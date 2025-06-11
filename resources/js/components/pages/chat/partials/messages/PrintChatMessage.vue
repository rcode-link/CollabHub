<template>
    <div :class="{
        'hover:bg-gray-100  focus:outline-none focus:ring-2  dark:hover:bg-gray-600  dark:focus:ring-gray-500':
            message.videocall === null,
        'flex rounded cursor-pointer mb-0.5  ml-10 message-container': true,
    }" :id="`message-${message.id}`">
        <div class="flex-1 p-1">
            <div class="text-xs font-bold" v-if="message.parent">
                <Editor class="reply-editor-class" :editable="false" :model="message.parent.text" />
                <ArrowUpCurvedIcon class="w-4 h-4 text-gray-800 dark:text-gray-300" />
            </div>
            <Editor ref="editor" :class="{
                'ml-4 -mt-4': message.parent,
            }" :model="message.message" :editable="false" />
            <div class="flex gap-4 flex-wrap">
                <PrintFiles v-if="message.media.length" :media="message.media" />
            </div>
            <router-link v-if="message.videocall && message.videocall.slug" :to="{
                query: {
                    callId: message.videocall.slug,
                },
            }" :class="{ 'flex w-2/5': true }">
                <fwb-badge type="red" class="flex justify-start w-full gap-2 py-2 px-4">
                    <PhoneIcon class="w-4 h-4" />
                    Call
                </fwb-badge>
            </router-link>
            <div v-if="Object.keys(reactions).length" class="flex mt-1">
                <fwb-badge v-for="key in Object.keys(reactions)" size="sm" v-bind:key="key">
                    <template #icon>
                        {{ key }}
                    </template>
                    {{ reactions[key].length }}
                </fwb-badge>
            </div>
        </div>
    </div>
</template>
<script setup>
import Editor from '@/components/shared/Editor.vue'
import PrintFiles from '@/components/shared/PrintFiles.vue'
import { FwbBadge, FwbP } from 'flowbite-vue'
import { DateTime } from 'luxon'
import { computed, ref } from 'vue'
import _ from 'lodash'
import EclipsisVerticalIcon from '@/components/shared/icons/EclipsisVerticalIcon.vue'

import ArrowUpCurvedIcon from '@/components/shared/icons/ArrowUpCurvedIcon.vue'
import PhoneIcon from '@/components/shared/icons/PhoneIcon.vue'
const hovered = ref(false)
const props = defineProps({
    message: {},
})
const reactions = computed(() => _.groupBy(props.message.reactions, 'reaction'))
</script>
<style scoped>
.reply-editor-class {
    width: calc(100% - 4rem);
    margin-bottom: 1rem;
}

.message-container .date-time {
    opacity: 0;
}
</style>
