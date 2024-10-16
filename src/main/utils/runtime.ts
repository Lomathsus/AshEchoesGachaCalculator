// 开发环境动态调整路径
import { app } from 'electron'
import url from 'node:url'
import path from 'path'

const isDevelopment = process.env.NODE_ENV === 'development'

const isProduction = process.env.NODE_ENV === 'production'

const assetsPath = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, 'assets')

const startURL = isProduction
  ? url.format({
      pathname: path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
      protocol: 'file:',
      slashes: true,
    })
  : MAIN_WINDOW_VITE_DEV_SERVER_URL || 'http://localhost:5173/'

export { assetsPath, startURL }
