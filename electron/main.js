const { app, BrowserWindow, Notification, ipcMain, Tray, Menu, nativeImage, shell } = require('electron')
const path = require('path')
const Store = require('electron-store')
const fs = require('fs')

// Force Unity/AppIndicator on Linux for system tray support
// This is required for COSMIC, GNOME, KDE with StatusNotifierItem
if (process.platform === 'linux') {
  app.commandLine.appendSwitch('enable-features', 'StatusNotifierItem')

  // Check for XDG_SESSION_TYPE to set proper Ozone platform
  if (process.env.XDG_SESSION_TYPE === 'wayland' || process.env.WAYLAND_DISPLAY) {
    app.commandLine.appendSwitch('ozone-platform-hint', 'auto')
  }
}

const store = new Store({
  defaults: {
    serverUrl: '',
    windowBounds: { width: 1280, height: 800 },
  },
})

let mainWindow = null
let tray = null

function createWindow() {
  const { width, height } = store.get('windowBounds')

  mainWindow = new BrowserWindow({
    width,
    height,
    minWidth: 800,
    minHeight: 600,
    title: 'CollabHub',
    icon: path.join(__dirname, 'icons', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: true,
    },
    // Slack-like frame
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    backgroundColor: '#1a1a2e',
    show: false,
  })

  // Save window size on resize
  mainWindow.on('resize', () => {
    const bounds = mainWindow.getBounds()
    store.set('windowBounds', { width: bounds.width, height: bounds.height })
  })

  // Show when ready to avoid white flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // Handle external links - open in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    const serverUrl = store.get('serverUrl')
    if (serverUrl && url.startsWith(serverUrl)) {
      return { action: 'allow' }
    }
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // Navigate inside the app for same-origin links
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const serverUrl = store.get('serverUrl')
    if (serverUrl && !url.startsWith(serverUrl)) {
      event.preventDefault()
      shell.openExternal(url)
    }
  })

  // Minimize to tray instead of closing (Slack-like behavior)
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault()
      mainWindow.hide()
    }
  })

  loadApp()
}

function loadApp() {
  const serverUrl = store.get('serverUrl')

  if (!serverUrl) {
    mainWindow.loadFile(path.join(__dirname, 'connect.html'))
  } else {
    mainWindow.loadURL(serverUrl)
  }
}

function createTray() {
  // Build absolute icon path and verify it exists
  const iconPath = path.join(__dirname, 'icons', 'tray-icon.png')

  if (!fs.existsSync(iconPath)) {
    console.error('Tray icon not found at:', iconPath)
    return
  }

  // On Linux, Tray works best with an absolute file path string
  // rather than a nativeImage object (required for StatusNotifierItem/DBus)
  if (process.platform === 'linux') {
    tray = new Tray(iconPath)
  } else {
    // macOS/Windows: use nativeImage with HiDPI support
    const icon1x = path.join(__dirname, 'icons', 'tray-icon@1x.png')
    const icon2x = path.join(__dirname, 'icons', 'tray-icon@2x.png')
    let trayIcon
    try {
      trayIcon = nativeImage.createFromPath(icon1x)
      const hiDpi = nativeImage.createFromPath(icon2x)
      trayIcon.addRepresentation({ scaleFactor: 2.0, buffer: hiDpi.toPNG() })
    } catch {
      trayIcon = nativeImage.createFromPath(iconPath)
    }
    if (process.platform === 'darwin') {
      trayIcon.setTemplateImage(true)
    }
    tray = new Tray(trayIcon)
  }

  tray.setToolTip('CollabHub')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open CollabHub',
      click: () => {
        mainWindow.show()
        mainWindow.focus()
      },
    },
    { type: 'separator' },
    {
      label: 'Change Server',
      click: () => {
        store.set('serverUrl', '')
        mainWindow.show()
        loadApp()
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true
        app.quit()
      },
    },
  ])

  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.focus()
    } else {
      mainWindow.show()
    }
  })
}

// IPC Handlers

// Set server URL from connect page
ipcMain.handle('set-server-url', (_event, url) => {
  // Normalize URL - remove trailing slash
  const normalized = url.replace(/\/+$/, '')
  store.set('serverUrl', normalized)
  mainWindow.loadURL(normalized)
  return true
})

// Get current server URL
ipcMain.handle('get-server-url', () => {
  return store.get('serverUrl')
})

// Show native notification
ipcMain.handle('show-notification', (_event, { title, body, icon }) => {
  if (!Notification.isSupported()) return false

  const notification = new Notification({
    title: title || 'CollabHub',
    body: body || '',
    icon: icon || path.join(__dirname, 'icons', 'icon.png'),
    silent: false,
  })

  notification.on('click', () => {
    mainWindow.show()
    mainWindow.focus()
  })

  notification.show()
  return true
})

// Update badge count (unread messages)
ipcMain.handle('set-badge-count', (_event, count) => {
  if (process.platform === 'darwin') {
    app.dock.setBadge(count > 0 ? String(count) : '')
  } else if (process.platform === 'linux') {
    app.setBadgeCount(count)
  }
  // Update tray tooltip
  if (tray) {
    tray.setToolTip(count > 0 ? `CollabHub (${count} unread)` : 'CollabHub')
  }
  return true
})

// App lifecycle
app.whenReady().then(() => {
  createWindow()
  createTray()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    } else {
      mainWindow.show()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  app.isQuitting = true
})
