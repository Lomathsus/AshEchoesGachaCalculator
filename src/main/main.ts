import { BrowserWindow, app, ipcMain } from 'electron'
import path from 'path'

import initServices from './services/init'
import { saveSpecificCookiesAsJson } from './utils/saveCookies'

initServices()

// 检查是否处于开发环境
const isDev = process.env.NODE_ENV === 'development'
console.log('NODE_ENV', isDev ? 'development' : 'production')

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

let mainWindow: BrowserWindow | null = null
let authWindow: BrowserWindow | null = null

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 750,
    height: 680,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '../../assets/images/icon.png'),
  })

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`))
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}

function createAuthWindow() {
  authWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  authWindow.loadURL('https://seed.qq.com/act/a20240905record/index.html')

  // 在此处理认证窗口关闭事件
  authWindow.on('closed', () => {
    authWindow = null
    // 获取并保存 cookies
    saveSpecificCookiesAsJson('token')
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.whenReady().then(() => {
  app.dock.setIcon(path.join(__dirname, '../../assets/images/icon.png'))

  createWindow()

  ipcMain.on('open-auth-window', () => {
    if (!authWindow) {
      createAuthWindow()
    }
  })

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
