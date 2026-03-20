import { ref, watch, onBeforeUnmount, getCurrentInstance, markRaw } from 'vue'
import { HocuspocusProvider } from '@hocuspocus/provider'
import * as Y from 'yjs'
import { useUserStore } from '@/store/user.js'

/**
 * Composable for Y.js collaboration via Hocuspocus server.
 * Resolves user data reactively from the user store.
 */
export function useCollaboration({ documentId }) {
  const userStore = useUserStore()
  const isConnected = ref(false)
  const isSynced = ref(false)
  const connectedUsers = ref([])

  const collabUrl = window.env?.VITE_COLLAB_URL || 'ws://localhost:6002'
  const token = localStorage.getItem('token') || ''

  const ydoc = markRaw(new Y.Doc())

  const provider = markRaw(
    new HocuspocusProvider({
      url: collabUrl,
      name: `document.${documentId}`,
      document: ydoc,
      token,
      onConnect() {
        isConnected.value = true
      },
      onDisconnect() {
        isConnected.value = false
      },
      onSynced() {
        isSynced.value = true
      },
      onAwarenessUpdate({ states }) {
        connectedUsers.value = states
          .filter(s => s.user)
          .map(s => s.user)
      },
    }),
  )

  // Set awareness reactively — updates when userStore.user changes
  const updateAwareness = () => {
    const u = userStore.user
    if (!u?.id) return

    const color = getUserColor(u.id)
    provider.setAwarenessField('user', {
      id: u.id,
      name: u.name || 'Unknown',
      avatar: u.avatar || null,
      color,
    })
  }

  // Set immediately if user data is available
  updateAwareness()

  // Watch for user store updates (in case it loads after mount)
  const stopWatch = watch(() => userStore.user, updateAwareness, { deep: true })

  const destroy = () => {
    stopWatch()
    provider.destroy()
    ydoc.destroy()
  }

  if (getCurrentInstance()) {
    onBeforeUnmount(destroy)
  }

  return {
    ydoc,
    provider,
    isConnected,
    isSynced,
    connectedUsers,
    destroy,
  }
}

function getUserColor(id) {
  const hash = String(id)
    .split('')
    .reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0)
  return `hsl(${Math.abs(hash) % 360}, 70%, 60%)`
}
