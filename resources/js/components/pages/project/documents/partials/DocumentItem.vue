<script setup>
import DocumentPrintTree from '@/components/pages/project/documents/partials/DocumentPrintTree.vue'
import { inject, ref } from 'vue'
import { DateTime } from 'luxon'

const navigateToDocument = inject('navigateToDocument')
const props = defineProps({ obj: Object, depth: { type: Number, default: 0 } })

const open = ref(false)

const handleClick = () => {
    if (props.obj.type === 'folder' || props.obj.type === 'project-folder') {
        open.value = !open.value
        return
    }
    if (props.obj.type === 'link') {
        window.open(props.obj.url, '_blank')
        return
    }
    navigateToDocument(props.obj.id)
}
</script>

<template>
    <!-- Row -->
    <div
        @click="handleClick"
        :style="{ paddingLeft: `${depth * 1.25 + 1}rem` }"
        class="group flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 last:border-0 pr-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition select-none"
    >
        <!-- Chevron -->
        <svg
            v-if="obj.type === 'folder' || obj.type === 'project-folder'"
            :class="['h-3.5 w-3.5 flex-shrink-0 text-gray-400 transition-transform', open ? 'rotate-90' : '']"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <div v-else class="w-3.5 flex-shrink-0" />

        <!-- Icon -->
        <div class="flex-shrink-0">
            <!-- Project folder -->
            <svg v-if="obj.type === 'project-folder'" class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
            <!-- Regular folder -->
            <svg v-else-if="obj.type === 'folder'" class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
            <!-- Link -->
            <svg v-else-if="obj.type === 'link'" class="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <!-- File -->
            <svg v-else class="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        </div>

        <!-- Title -->
        <span class="flex-1 truncate text-sm font-medium text-gray-800 dark:text-gray-100">
            {{ obj.title }}
        </span>

        <!-- Meta (files only) -->
        <template v-if="obj.type === 'file'">
            <span v-if="obj.file_id" class="hidden sm:inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs font-mono text-gray-500 dark:text-gray-400">
                {{ obj.file_id }}
            </span>
            <span class="hidden md:block flex-shrink-0 text-xs text-gray-400">
                {{ DateTime.fromISO(obj.updated_at).toRelative() }}
            </span>
        </template>

        <!-- Meta (links) -->
        <template v-else-if="obj.type === 'link'">
            <span class="hidden sm:inline-flex text-xs text-purple-400 truncate max-w-xs">{{ obj.url }}</span>
        </template>

        <!-- Folder / project-folder expand hint -->
        <template v-else>
            <span class="text-xs text-gray-400">
                {{ open ? 'collapse' : 'expand' }}
            </span>
        </template>

        <!-- Hover arrow (files and links) -->
        <svg v-if="obj.type === 'file' || obj.type === 'link'" class="h-4 w-4 flex-shrink-0 text-gray-300 opacity-0 group-hover:opacity-100 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <div v-else class="w-4 flex-shrink-0" />
    </div>

    <!-- Children -->
    <div v-show="open">
        <DocumentPrintTree
            :parent_id="obj.id"
            :depth="depth + 1"
            :entity-id="obj.entity_id"
            :entity-type="obj.entity_type"
        />
    </div>
</template>
