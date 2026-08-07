<script setup>
import { computed, ref, watch, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { generateHTML } from '@tiptap/core'
import { renderExtensions } from '@/functions/editor/renderExtensions'
import { buildTaskKeyPattern, extractTaskKeys } from '@/functions/editor/taskKeys'
import { useTextToLinkStore } from '@/store/textToLinkStore'
import VacationCard from '@/components/shared/vacationPlugin/VacationCard.vue'
import TaskPreviewCard from '@/components/shared/TaskPreviewCard.vue'
import LinkTooltip from '@/components/shared/LinkTooltip.vue'
import UserHoverCard from '@/components/shared/UserHoverCard.vue'

const props = defineProps({
    content: { type: [Object, String], default: null },
    // Task keys are always linked; this only controls the preview cards, which
    // are noise in compact contexts such as the reply-to excerpt.
    taskPreviews: { type: Boolean, default: true },
})

const router = useRouter()
const textToLinkStore = useTextToLinkStore()
const containerRef = ref(null)

const EMPTY = { html: '', vacationNodes: [], json: null }

// Rebuilt whenever the organization's project keys arrive/change
const taskKeyPattern = computed(() => buildTaskKeyPattern(textToLinkStore.items))

const parsed = computed(() => {
    if (!props.content) return EMPTY
    try {
        const json = typeof props.content === 'string'
            ? JSON.parse(props.content)
            : props.content
        if (!json?.type) return EMPTY

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

        return { html, vacationNodes, json: filteredJson }
    } catch {
        return EMPTY
    }
})

// Kept separate from `parsed` so late-arriving project keys don't force
// generateHTML() to re-run for every message on screen.
const taskKeys = computed(() => (
    props.taskPreviews ? extractTaskKeys(parsed.value.json, taskKeyPattern.value) : []
))

const COPY_SVG = '<svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"/></svg>'
const CHECK_SVG = '<svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>'

// Inject copy buttons into <pre> code blocks after generateHTML render
function enhanceCodeBlocks() {
    if (!containerRef.value) return
    const blocks = containerRef.value.querySelectorAll('pre')
    blocks.forEach(pre => {
        if (pre.querySelector('.code-copy-btn')) return

        const code = pre.querySelector('code')
        const btn = document.createElement('button')
        btn.type = 'button'
        btn.className = 'code-copy-btn'
        btn.innerHTML = `${COPY_SVG}<span>Copy</span>`

        btn.addEventListener('click', () => {
            const text = code ? code.textContent : pre.textContent
            navigator.clipboard.writeText(text).then(() => {
                btn.classList.add('copied')
                btn.innerHTML = `${CHECK_SVG}<span>Copied!</span>`
                setTimeout(() => {
                    btn.classList.remove('copied')
                    btn.innerHTML = `${COPY_SVG}<span>Copy</span>`
                }, 2000)
            })
        })
        pre.appendChild(btn)
    })
}

// Turn bare task keys (ABC-12) in the rendered text into links to the task.
// Done on the DOM rather than in the TipTap JSON so stored messages stay
// untouched and keys stay live even if a project key is added later.
function linkifyTaskKeys() {
    const pattern = taskKeyPattern.value
    if (!containerRef.value || !pattern) return

    const walker = document.createTreeWalker(containerRef.value, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            if (!node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT
            // Never touch existing links, code, or mentions
            return node.parentElement?.closest('a, code, pre, .mention')
                ? NodeFilter.FILTER_REJECT
                : NodeFilter.FILTER_ACCEPT
        },
    })

    const textNodes = []
    let current
    while ((current = walker.nextNode())) textNodes.push(current)

    textNodes.forEach(node => {
        const text = node.nodeValue
        pattern.lastIndex = 0
        if (!pattern.test(text)) return

        const fragment = document.createDocumentFragment()
        let lastIndex = 0
        let match
        pattern.lastIndex = 0

        while ((match = pattern.exec(text)) !== null) {
            if (match.index > lastIndex) {
                fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)))
            }

            const link = document.createElement('a')
            link.className = 'task-key-link'
            link.href = `/open/${match[0]}`
            link.dataset.taskKey = match[0]
            link.textContent = match[0]
            fragment.appendChild(link)

            lastIndex = match.index + match[0].length
        }

        if (lastIndex < text.length) {
            fragment.appendChild(document.createTextNode(text.slice(lastIndex)))
        }

        node.parentNode.replaceChild(fragment, node)
    })
}

function onContainerClick(event) {
    const link = event.target.closest?.('.task-key-link')
    if (!link) return

    event.preventDefault()
    router.push(`/open/${link.dataset.taskKey}`)
}

function enhance() {
    enhanceCodeBlocks()
    linkifyTaskKeys()
}

onMounted(() => nextTick(enhance))
watch(() => parsed.value.html, () => nextTick(enhance))
// Project keys load asynchronously — linkify again once they land
watch(taskKeyPattern, () => nextTick(linkifyTaskKeys))
</script>

<template>
    <div ref="containerRef" @click="onContainerClick">
        <div v-if="parsed.html" class="ProseMirror" v-html="parsed.html" />
        <VacationCard
            v-for="eventId in parsed.vacationNodes"
            :key="eventId"
            :event-id="eventId"
        />
        <TaskPreviewCard
            v-for="key in taskKeys"
            :key="key"
            :task-key="key"
        />
        <LinkTooltip v-if="containerRef" :container="containerRef" />
        <UserHoverCard v-if="containerRef" :container="containerRef" />
    </div>
</template>
