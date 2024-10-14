import { BrowserWindow, app, ipcMain, session } from 'electron'
import fs from 'fs'
import path from 'path'

import { makeChannelName, services } from './services'

// 检查是否处于开发环境
const isDev = process.env.NODE_ENV === 'development'

console.log('NODE_ENV', isDev ? 'development' : 'production')

type ApiFunction = (...args: any[]) => any

services.forEach((service) => {
  Object.entries(service.methods).forEach(([apiName, apiFn]: [string, ApiFunction]) => {
    ipcMain.handle(makeChannelName(service.name, apiName), (ev, ...args: any[]) => apiFn(...args))
  })
})

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
    height: 600,
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

function getAssetPath(subPath: string) {
  // 开发环境动态调整路径
  const basePath = app.isPackaged
    ? path.join(process.resourcesPath, 'assets', 'data')
    : path.join(__dirname, 'assets', 'data')
  return path.join(basePath, subPath)
}

function saveSpecificCookiesAsJson(cookieName: string) {
  const cookiePath = getAssetPath('cookies.json') // 使用动态路径
  const userDataPath = app.getPath('userData')
  console.log(userDataPath)
  session.defaultSession.cookies
    .get({})
    .then((cookies) => {
      const specificCookies = cookies.filter((cookie) => cookie.name === cookieName)
      fs.mkdirSync(path.dirname(cookiePath), { recursive: true }) // 确保目录存在
      fs.writeFileSync(cookiePath, JSON.stringify(specificCookies, null, 2))
      console.log('Specific cookies have been saved as JSON:', cookiePath)
    })
    .catch((error) => {
      console.error('Failed to get cookies:', error)
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
