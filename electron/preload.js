const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Notifications
  showNotification: (options) => ipcRenderer.invoke('show-notification', options),
  setBadgeCount: (count) => ipcRenderer.invoke('set-badge-count', count),

  // Server connection
  setServerUrl: (url) => ipcRenderer.invoke('set-server-url', url),
  getServerUrl: () => ipcRenderer.invoke('get-server-url'),

  // Platform info
  platform: process.platform,
  isElectron: true,
})
