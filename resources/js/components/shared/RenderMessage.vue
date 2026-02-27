<script setup>
import { computed, ref, onMounted } from 'vue'
import { generateHTML } from '@tiptap/core'
import { renderExtensions } from '@/functions/editor/renderExtensions'
import VacationCard from '@/components/shared/vacationPlugin/VacationCard.vue'
import LinkTooltip from '@/components/shared/LinkTooltip.vue'

const props = defineProps({
    content: { type: [Object, String], default: null },
})

const containerRef = ref(null)

const parsed = computed(() => {
    if (!props.content) return { html: '', vacationNodes: [] }
    try {
        const json = typeof props.content === 'string'
            ? JSON.parse(props.content)
            : props.content
        if (!json?.type) return { html: '', vacationNodes: [] }

        const vacationNodes = []
        if (json.content) {
            json.content.forEach(node => {
                if (node.type === 'vacation' && node.attrs?.eventId) {
                    vacationNodes.push(node.attrs.eventId)
                }
            })
        }

        // Filter out vacation nodes — they'll be rendered as Vue components
        const filteredJson = vacationNodes.length
            ? { ...json, content: json.content.filter(n => n.type !== 'vacation') }
            : json

        const html = filteredJson.content?.length
            ? generateHTML(filteredJson, renderExtensions)
            : ''

        return { html, vacationNodes }
    } catch {
        return { html: '', vacationNodes: [] }
    }
})
</script>

<template>
    <div ref="containerRef">
        <div v-if="parsed.html" class="ProseMirror" v-html="parsed.html" />
        <VacationCard
            v-for="eventId in parsed.vacationNodes"
            :key="eventId"
            :event-id="eventId"
        />
        <LinkTooltip v-if="containerRef" :container="containerRef" />
    </div>
</template>
