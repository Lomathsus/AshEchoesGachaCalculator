import axios from 'axios'
import { BrowserWindow, app, ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'

import { baseBody, characterBody, memoryTraceBody } from '@/main/constant'
import registerIpcHandle from '@/main/ipc/handlers'
import { startURL } from '@/main/utils/runtime'

import { getDataPath, saveSpecificCookiesAsJson } from './utils/saveCookies'

registerIpcHandle()

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

  // 读取本地文件并做判断
  fs.readFile(path.join(__dirname, 'assets', 'data', 'cookie.json'), 'utf-8', (err, data) => {
    if (err || !data) {
      // 文件不存在或者读取失败，导航到 /auth
      mainWindow.loadURL(`${startURL}/#/login`)
    } else {
      // 文件存在且读取成功，导航到 /home
      mainWindow.loadURL(startURL)
    }
  })

  ipcMain.handle('fetch-gacha-data', async (event, params: { dateRange: [number, number]; type: string }) => {
    const cookiePath = getDataPath('cookies.json') // 使用动态路径
    try {
      const json = fs.readFileSync(cookiePath, 'utf-8')
      const body = {
        ...baseBody,
        ...(params.type === 'memoryTrace' ? memoryTraceBody : characterBody),
        startTime: params.dateRange[0],
        endTime: params.dateRange[1],
      }
      const response = await axios.post('https://comm.ams.game.qq.com/ide/', body, {
        headers: {
          accept: 'application/json, text/plain, */*',
          'accept-language': 'zh-CN,zh;q=0.9',
          origin: 'https://seed.qq.com',
          priority: 'u=1, i',
          referer: 'https://seed.qq.com/',
          'content-type': 'application/x-www-form-urlencoded',
          Host: 'comm.ams.game.qq.com',
          Connection: 'keep-alive',
          Cookie: JSON.parse(json)
            .map((item) => `${item.name}=${item.value}`)
            .join(';'),
        },
      })

      return JSON.parse(
        JSON.stringify({
          data: response.data.jData.data,
          code: response.status,
        })
      )
    } catch (err) {
      console.error('读取文件时发生错误:', err)
    }
  })
  // 监听导航到首页的事件
  ipcMain.on('navigate-home', () => {
    if (mainWindow) {
      mainWindow.loadURL(startURL)
    }
  })
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
      .then((cookiePath) => {
        // 保存完成后检查文件并导航
        fs.readFile(cookiePath, 'utf-8', (err, data) => {
          if (err || !data) {
            console.log('cookie.json 文件不存在或读取失败')
          } else {
            console.log('cookie.json 文件存在，导航到首页')
            if (mainWindow) {
              mainWindow.loadURL(startURL)
            }
          }
        })
      })
      .catch((error) => {
        console.error('保存 cookies 失败:', error)
      })
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
