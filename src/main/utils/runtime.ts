// 开发环境动态调整路径
import { app } from 'electron'
import url from 'node:url'
import path from 'path'

const assetsPath = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../assets')

const resourcesPath = app.isPackaged ? process.resourcesPath : path.join(__dirname, '../../build-resources')

const startURL = app.isPackaged
  ? url.format({
      pathname: path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
      protocol: 'file:',
      slashes: true,
    })
  : MAIN_WINDOW_VITE_DEV_SERVER_URL || 'http://localhost:5173/'

export { assetsPath, startURL, resourcesPath }
