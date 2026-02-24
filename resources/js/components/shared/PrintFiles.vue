<script setup>
import FileImage from '@/components/shared/icons/FileImage.vue'
import AuthImage from '@/components/shared/AuthImage.vue'
import { ref, onMounted, onUnmounted } from 'vue'

defineProps({ media: Array, full: { type: Boolean, default: false } })

const lightbox = ref(null) // { path, name }

const open = (obj) => { lightbox.value = obj }
const close = () => { lightbox.value = null }

async function openFile(url) {
    if (url.startsWith('/api/v1/') || url.includes('/api/v1/')) {
        try {
            const { data } = await window.axios.get(url)
            window.open(data.url, '_blank')
        } catch {
            // silently fail
        }
    } else {
        window.open(url, '_blank')
    }
}

const onKey = (e) => { if (e.key === 'Escape') close() }
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
    <!-- Lightbox -->
    <teleport to="#app">
        <div
            v-if="lightbox"
            class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
            @click.self="close"
        >
            <AuthImage
                :src="lightbox.path"
                :alt="lightbox.name"
                class="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            />
            <div class="mt-3 flex items-center gap-4">
                <span class="text-sm text-gray-300">{{ lightbox.name }}</span>
                <button
                    @click="openFile(lightbox.path)"
                    class="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20 transition"
                >
                    Open original
                </button>
                <button
                    @click="close"
                    class="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20 transition"
                >
                    Close
                </button>
            </div>
        </div>
    </teleport>

    <!-- Inline media -->
    <template v-for="obj in media" :key="obj.name">
        <!-- Image thumbnail -->
        <div v-if="obj.type?.startsWith('image/')" class="inline-block">
            <AuthImage
                :src="obj.path"
                :alt="obj.name"
                @click="open(obj)"
                class="w-36 h-auto rounded-lg shadow cursor-pointer object-cover hover:opacity-90 transition"
            />
            <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate w-36">{{ obj.name }}</p>
        </div>

        <!-- Non-image file -->
        <button
            v-else
            @click="openFile(obj.path)"
            :class="[
                'flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition text-left',
                full ? 'w-full' : 'w-fit',
            ]"
        >
            <FileImage class="h-8 w-8 flex-shrink-0 text-gray-400" />
            <div class="min-w-0">
                <p class="truncate text-sm font-medium text-gray-800 dark:text-gray-100">{{ obj.name }}</p>
                <p class="text-xs text-gray-400">{{ obj.type }}</p>
            </div>
        </button>
    </template>
</template>
