<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import AdvancedEditor from '@/components/shared/advancedEditor/Index.vue'
import Comments from '@/components/pages/project/tasks/partisals/details/Comments.vue'
import { useRoute } from 'vue-router'
import { useBreadcrumbStore } from '@/store/breadcrumb'
import { useAbility } from '@casl/vue'
import { useUserStore } from '@/store/user'
import { DateTime } from 'luxon'
import { useCollaboration } from '@/functions/editor/colab/useCollaboration'

const { can } = useAbility()
const userStore = useUserStore()
const document = ref({})
const saving = ref(false)
const saved = ref(false)
const loaded = ref(false)
const shareOpen = ref(false)
const shareLoading = ref(false)
const copied = ref(false)
const exporting = ref(false)
const avatarErrors = ref({})
const commentsOpen = ref(false)
const chatId = ref(null)
const chatLoading = ref(false)
const editorRef = ref(null)
const pendingComment = ref(null)
const activeCommentId = ref(null)
const route = useRoute()
const breadcrumbStore = useBreadcrumbStore()

const canUpdate = computed(() => can(`can-update-document.${document.value.id}`, ''))

// Initialize collaboration during setup (so lifecycle hooks work)
const collab = useCollaboration({ documentId: route.params.id })

const relativeTime = computed(() =>
  document.value.updated_at
    ? DateTime.fromISO(document.value.updated_at).toRelative()
    : null
)

const shareUrl = computed(() =>
  document.value.share_token
    ? `${window.location.origin}/d/${document.value.share_token}`
    : null
)

const load = () => {
  axios.get(`/api/v1/files/${route.params.id}`).then((response) => {
    document.value = response.data
    chatId.value = response.data.chat_id || null
    breadcrumbStore.addEntry([
      {
        link: { name: 'project.documents', params: { project: route.params.project } },
        title: 'Documents',
      },
      { title: response.data.title },
    ])
    nextTick(() => { loaded.value = true })
  })
}

const save = () => {
  saving.value = true
  saved.value = false
  axios.put(`/api/v1/files/${route.params.id}`, {
    title: document.value.title,
    content: document.value.content,
  }).then(() => {
    document.value.updated_at = new Date().toISOString()
    saved.value = true
  }).finally(() => {
    saving.value = false
  })
}

let saveTimer = null
const scheduleAutosave = () => {
  if (!loaded.value || !canUpdate.value) return
  saved.value = false
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => save(), 500)
}

watch(() => document.value.content, scheduleAutosave, { deep: true })
watch(() => document.value.title, scheduleAutosave)

const enableShare = () => {
  shareLoading.value = true
  axios.post(`/api/v1/files/${document.value.id}/share`)
    .then(({ data }) => { document.value.share_token = data.share_token })
    .finally(() => { shareLoading.value = false })
}

const revokeShare = () => {
  shareLoading.value = true
  axios.delete(`/api/v1/files/${document.value.id}/share`)
    .then(() => { document.value.share_token = null })
    .finally(() => { shareLoading.value = false })
}

const copyLink = () => {
  if (!shareUrl.value) return
  navigator.clipboard.writeText(shareUrl.value).then(() => {
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  })
}

const ensureChat = async () => {
  if (chatId.value) return chatId.value
  chatLoading.value = true
  try {
    const { data } = await axios.post(`/api/v1/files/${document.value.id}/chat`)
    chatId.value = data.chat_id
    return data.chat_id
  } finally {
    chatLoading.value = false
  }
}

const openComments = async () => {
  if (commentsOpen.value) {
    commentsOpen.value = false
    return
  }
  await ensureChat()
  commentsOpen.value = true
}

const addInlineComment = async () => {
  const editor = editorRef.value?.editor
  if (!editor) return

  const { from, to, empty } = editor.state.selection
  if (empty) return

  const selectedText = editor.state.doc.textBetween(from, to, ' ')
  if (!selectedText.trim()) return

  const commentId = crypto.randomUUID()

  // Apply the comment mark to the selected text
  editor.chain().focus().setMark('comment', { commentId }).run()

  await ensureChat()
  commentsOpen.value = true
  pendingComment.value = { commentId, quotedText: selectedText }
}

const onEditorReady = (editor) => {
  // Listen for clicks on comment marks in the editor
  editor.view.dom.addEventListener('click', (e) => {
    const commentEl = e.target.closest('.comment-highlight')
    if (!commentEl) {
      activeCommentId.value = null
      return
    }
    const cId = commentEl.getAttribute('data-comment-id')
    if (cId) {
      activeCommentId.value = cId
      commentsOpen.value = true
      ensureChat()
    }
  })
}

const cancelPendingComment = () => {
  // Remove the mark that was applied
  if (pendingComment.value && editorRef.value?.editor) {
    const editor = editorRef.value.editor
    const { doc } = editor.state
    // Find and remove the mark with this commentId
    doc.descendants((node, pos) => {
      const mark = node.marks.find(
        m => m.type.name === 'comment' && m.attrs.commentId === pendingComment.value.commentId
      )
      if (mark) {
        editor.chain().setTextSelection({ from: pos, to: pos + node.nodeSize }).unsetMark('comment').run()
      }
    })
  }
  pendingComment.value = null
}

const onCommentSent = () => {
  pendingComment.value = null
}

const removeCommentMark = () => {
  const editor = editorRef.value?.editor
  if (!editor) return
  editor.chain().focus().unsetMark('comment').run()
}

const exportPdf = () => {
  exporting.value = true
  axios.post(`/api/v1/files/${document.value.id}/export-pdf`, null, { responseType: 'blob' })
    .then(({ data }) => {
      const url = URL.createObjectURL(data)
      const a = window.document.createElement('a')
      a.href = url
      a.download = (document.value.title || 'document') + '.pdf'
      a.click()
      URL.revokeObjectURL(url)
    })
    .finally(() => { exporting.value = false })
}

load()
</script>

<template>
  <div class="min-h-full flex flex-col">

    <!-- Sticky document header -->
    <div class="sticky top-0 z-30 flex items-center gap-3 px-5 h-11 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 shrink-0">

      <!-- Editable title -->
      <input
        v-model="document.title"
        :readonly="!canUpdate"
        class="font-semibold text-sm text-gray-800 dark:text-white truncate min-w-0 flex-1 bg-transparent border-none outline-none placeholder-gray-300 dark:placeholder-gray-600"
        placeholder="Untitled"
      />

      <!-- File ID badge -->
      <span
        v-if="document.file_id"
        class="font-mono text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-400 rounded px-1.5 py-0.5 shrink-0"
      >{{ document.file_id }}</span>

      <!-- Collaborators avatars -->
      <div v-if="collab.connectedUsers.value?.length > 1" class="flex items-center -space-x-1.5 shrink-0">
        <template v-for="u in collab.connectedUsers.value.filter(u => u.id !== userStore.user.id)" :key="u.id">
          <img
            v-if="u.avatar && !avatarErrors[u.id]"
            :src="u.avatar"
            :alt="u.name"
            :title="u.name"
            class="w-6 h-6 rounded-full border-2 border-white dark:border-gray-900 object-cover"
            @error="avatarErrors[u.id] = true"
          />
          <div
            v-else
            class="w-6 h-6 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center text-[10px] font-semibold text-white"
            :style="{ backgroundColor: u.color || '#6B7280' }"
            :title="u.name"
          >
            {{ (u.name || '?').charAt(0).toUpperCase() }}
          </div>
        </template>
      </div>

      <!-- Connection status -->
      <div class="flex items-center gap-1 shrink-0">
        <span
          class="w-1.5 h-1.5 rounded-full"
          :class="collab.isConnected.value ? 'bg-green-500' : 'bg-red-500'"
        ></span>
      </div>

      <!-- Save status -->
      <div class="flex items-center gap-1.5 shrink-0 text-xs">
        <template v-if="saving">
          <svg class="w-3 h-3 animate-spin text-blue-400" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="15 45" stroke-linecap="round"/>
          </svg>
          <span class="text-blue-500">Saving…</span>
        </template>
        <template v-else-if="saved && relativeTime">
          <svg class="w-3 h-3 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 13l4 4L19 7"/>
          </svg>
          <span class="text-gray-400">Saved {{ relativeTime }}</span>
        </template>
        <template v-else-if="relativeTime">
          <span class="text-gray-400">Edited {{ relativeTime }}</span>
        </template>
      </div>

      <!-- Toggle comments panel -->
      <button
        class="inline-flex items-center justify-center gap-1.5 text-xs px-2.5 py-1 rounded-md border transition-colors shrink-0 disabled:opacity-50"
        :class="commentsOpen
          ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'"
        :disabled="chatLoading"
        @click="openComments"
      >
        <svg v-if="chatLoading" class="w-3.5 h-3.5 shrink-0 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="15 45" stroke-linecap="round"/>
        </svg>
        <svg v-else class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        Comments
      </button>

      <!-- Export PDF button -->
      <button
        class="inline-flex items-center justify-center gap-1.5 text-xs px-2.5 py-1 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shrink-0 disabled:opacity-50"
        :disabled="exporting"
        @click="exportPdf"
      >
        <svg v-if="exporting" class="w-3.5 h-3.5 shrink-0 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="15 45" stroke-linecap="round"/>
        </svg>
        <svg v-else class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        {{ exporting ? 'Exporting…' : 'PDF' }}
      </button>

      <!-- Share button -->
      <div v-if="canUpdate" class="relative shrink-0">
        <button
          class="inline-flex items-center justify-center gap-1.5 text-xs px-2.5 py-1 rounded-md border transition-colors"
          :class="document.share_token
            ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'"
          @click="shareOpen = !shareOpen"
        >
          <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          Share
        </button>

        <!-- Backdrop to close panel on outside click -->
        <div v-if="shareOpen" class="fixed inset-0 z-40" @click="shareOpen = false" />

        <!-- Share panel -->
        <Transition
          enter-active-class="transition ease-out duration-100"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition ease-in duration-75"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="shareOpen"
            class="absolute right-0 top-full mt-1.5 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4 z-50"
          >
            <!-- Not shared -->
            <template v-if="!document.share_token">
              <p class="text-sm font-medium text-gray-800 dark:text-white mb-1">Share document</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Generate a public link so anyone can view this document without signing in.
              </p>
              <button
                class="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                :disabled="shareLoading"
                @click="enableShare"
              >
                <svg v-if="shareLoading" class="w-3.5 h-3.5 shrink-0 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="15 45" stroke-linecap="round"/>
                </svg>
                Create share link
              </button>
            </template>

            <!-- Shared -->
            <template v-else>
              <div class="flex items-center justify-between mb-3">
                <p class="text-sm font-medium text-gray-800 dark:text-white">Shared</p>
                <span class="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                  <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Public
                </span>
              </div>

              <!-- Link row -->
              <div class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg mb-3">
                <span class="flex-1 text-xs text-gray-600 dark:text-gray-300 truncate font-mono">{{ shareUrl }}</span>
                <button
                  class="shrink-0 text-xs px-2 py-1 rounded-md font-medium transition-colors"
                  :class="copied
                    ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'"
                  @click="copyLink"
                >
                  {{ copied ? 'Copied!' : 'Copy' }}
                </button>
              </div>

              <!-- Revoke -->
              <button
                class="w-full inline-flex items-center justify-center gap-2 px-3 py-1.5 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                :disabled="shareLoading"
                @click="revokeShare"
              >
                <svg v-if="shareLoading" class="w-3 h-3 shrink-0 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="15 45" stroke-linecap="round"/>
                </svg>
                Revoke link
              </button>
            </template>
          </div>
        </Transition>
      </div>

    </div>

    <!-- Loading skeleton -->
    <div v-if="!loaded" class="max-w-3xl mx-auto w-full py-12 px-10 flex flex-col gap-4 animate-pulse">
      <div class="h-9 bg-gray-100 dark:bg-gray-800 rounded-lg w-2/3"></div>
      <div class="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full"></div>
      <div class="h-4 bg-gray-100 dark:bg-gray-800 rounded w-5/6"></div>
      <div class="h-4 bg-gray-100 dark:bg-gray-800 rounded w-4/6"></div>
    </div>

    <!-- Editor + Comments layout -->
    <div v-else class="flex flex-1 min-h-0">
      <!-- Editor -->
      <div class="flex-1 min-w-0 overflow-y-auto">
        <div class="max-w-3xl mx-auto w-full flex flex-col gap-3 py-4">
          <AdvancedEditor
            ref="editorRef"
            :key="document.id"
            v-model="document.content"
            :editable="canUpdate"
            :notion="true"
            :collaborative="true"
            :ydoc="collab.ydoc"
            :provider="collab.provider"
            :document-id="document.id"
            @submitted="save"
            @ready="onEditorReady"
            @add-comment="addInlineComment"
            @remove-comment="removeCommentMark"
          />
        </div>
      </div>

      <!-- Comments side panel -->
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="translate-x-0"
        leave-to-class="translate-x-full"
      >
        <div
          v-if="commentsOpen && chatId"
          class="w-96 shrink-0 border-l border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col overflow-hidden"
        >
          <div class="flex items-center justify-between px-4 h-10 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <span class="text-sm font-semibold text-gray-800 dark:text-white">Comments</span>
            <button
              class="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              @click="commentsOpen = false"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Pending inline comment context -->
          <div v-if="pendingComment" class="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-amber-50/50 dark:bg-amber-900/10 shrink-0">
            <p class="text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-semibold mb-1">Commenting on</p>
            <p class="text-xs text-gray-700 dark:text-gray-300 italic line-clamp-3">"{{ pendingComment.quotedText }}"</p>
            <button
              class="mt-2 text-[10px] text-gray-400 hover:text-red-500 transition-colors"
              @click="cancelPendingComment"
            >Cancel</button>
          </div>

          <div class="flex-1 overflow-hidden">
            <Comments
              :chat-id="chatId"
              :pending-comment="pendingComment"
              :active-comment-id="activeCommentId"
              @comment-sent="onCommentSent"
            />
          </div>
        </div>
      </Transition>
    </div>

  </div>
</template>
