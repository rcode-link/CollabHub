<script setup>
import { ref, watch } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
    src: { type: String, required: true },
    alt: { type: String, default: '' },
})

const imageUrl = ref(null)
const loading = ref(true)
const error = ref(false)

function isProxyUrl(url) {
    return url && url.includes('/api/v1/')
}

async function resolveUrl(src) {
    loading.value = true
    error.value = false
    imageUrl.value = null

    if (!src) {
        loading.value = false
        error.value = true
        return
    }

    if (!isProxyUrl(src)) {
        imageUrl.value = src
        loading.value = false
        return
    }

    try {
        const { data } = await window.axios.get(src)
        imageUrl.value = data.url
    } catch {
        error.value = true
    } finally {
        loading.value = false
    }
}

function onImgError() {
    imageUrl.value = null
    error.value = true
}

watch(() => props.src, (val) => resolveUrl(val), { immediate: true })
</script>

<template>
    <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="alt"
        v-bind="$attrs"
        @error="onImgError"
    />
    <div
        v-else-if="loading"
        class="animate-pulse bg-gray-200 dark:bg-gray-700 rounded min-h-[6rem]"
        v-bind="$attrs"
    />
    <div
        v-else-if="error"
        class="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded min-h-[6rem] text-gray-400 dark:text-gray-500 text-xs"
        v-bind="$attrs"
    >
        <svg class="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
        </svg>
        {{ alt || 'Image' }}
    </div>
</template>
