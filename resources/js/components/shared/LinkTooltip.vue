<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  container: { type: Object, default: null },
})

const tooltip = ref(null)
const visible = ref(false)
const loading = ref(false)
const position = ref({ x: 0, y: 0 })
const meta = ref({ url: '', title: '', description: '', image: null })

const cache = new Map()
let hideTimeout = null
let showTimeout = null
let currentHref = null

function onMouseOver(e) {
  const link = e.target.closest?.('a[href]')
  if (!link) return

  const href = link.getAttribute('href')
  if (!href || href.startsWith('#') || href.startsWith('javascript:')) return

  clearTimeout(hideTimeout)
  clearTimeout(showTimeout)
  currentHref = href

  showTimeout = setTimeout(() => {
    if (currentHref !== href) return
    const rect = link.getBoundingClientRect()
    position.value = {
      x: rect.left + rect.width / 2,
      y: rect.top,
    }
    meta.value = { url: href, title: '', description: '', image: null }
    visible.value = true
    fetchMeta(href)
  }, 400)
}

function onMouseOut(e) {
  const link = e.target.closest?.('a[href]')
  if (!link) return
  clearTimeout(showTimeout)
  currentHref = null
  hideTimeout = setTimeout(() => {
    visible.value = false
  }, 200)
}

function onTooltipEnter() {
  clearTimeout(hideTimeout)
}

function onTooltipLeave() {
  visible.value = false
}

async function fetchMeta(url) {
  if (cache.has(url)) {
    meta.value = cache.get(url)
    return
  }
  loading.value = true
  try {
    const { data } = await window.axios.post('/api/v1/link-preview', { url })
    const result = {
      url: data.url || url,
      title: data.title || '',
      description: data.description || '',
      image: data.image || null,
    }
    cache.set(url, result)
    if (currentHref === url || visible.value) {
      meta.value = result
    }
  } catch {
    // Keep showing URL only
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const el = props.container
  if (!el) return
  el.addEventListener('mouseover', onMouseOver)
  el.addEventListener('mouseout', onMouseOut)
})

onBeforeUnmount(() => {
  const el = props.container
  if (!el) return
  el.removeEventListener('mouseover', onMouseOver)
  el.removeEventListener('mouseout', onMouseOut)
  clearTimeout(hideTimeout)
  clearTimeout(showTimeout)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="visible"
        ref="tooltip"
        class="fixed z-[9999] w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden"
        :style="{ left: position.x + 'px', top: (position.y - 8) + 'px', transform: 'translate(-50%, -100%)' }"
        @mouseenter="onTooltipEnter"
        @mouseleave="onTooltipLeave"
      >
        <!-- Loading skeleton -->
        <div v-if="loading && !meta.title" class="p-3 space-y-2">
          <div class="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div class="h-2.5 w-full bg-gray-100 dark:bg-gray-700/60 rounded animate-pulse" />
          <div class="h-2.5 w-2/3 bg-gray-100 dark:bg-gray-700/60 rounded animate-pulse" />
        </div>

        <!-- Preview content -->
        <template v-else>
          <img
            v-if="meta.image"
            :src="meta.image"
            :alt="meta.title"
            class="w-full h-32 object-cover"
            @error="meta.image = null"
          />
          <div class="p-3">
            <p v-if="meta.title" class="text-sm font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2">
              {{ meta.title }}
            </p>
            <p v-if="meta.description" class="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
              {{ meta.description }}
            </p>
            <p class="mt-1.5 text-xs text-gray-400 dark:text-gray-500 truncate">
              {{ meta.url }}
            </p>
          </div>
        </template>
      </div>
    </Transition>
  </Teleport>
</template>
